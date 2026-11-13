import http from 'http';

const API_KEY = '你的key'; 
const TARGET_URL = '你要连的大模型';

const server = http.createServer(async (req, res) => {
  // 1. 处理浏览器的 CORS 预检请求（OPTIONS）
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // 2. 拦截前端发来的 POST 请求
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    const upstreamController = new AbortController();

    req.on('data', chunk => { body += chunk; });
    res.on('close', () => {
        // 如果 fetch 支持 AbortController，这里也调用 controller.abort()
        // 如果响应还没有发送完（writableEned 为false，说明是用户主动点了停止）
        if(!res.writableEnded){
            console.log('用户主动点了停止，正在中止后端请求...');
            upstreamController.abort(); // 发给智能体切断请求
        } else{
            console.log('正常传输完毕，自动断开连接')
        }
    });
    req.on('end', async () => {
      try {
        // 3. 代理服务器带上 Key，向智谱发起请求
        const response = await fetch(TARGET_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: body, // 直接把前端传来的请求体透传给智谱
          signal: upstreamController.signal
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ 代理服务器捕获到错误 [${response.status}]:`, errorText);
          
          // 加上这段，把错误直接丢给前端，并结束当前请求，防止继续往下走报错
          res.writeHead(response.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(errorText);
          return; 
        }

        // 4. 设置响应头，告诉浏览器“我允许跨域，且我要发流式数据了”
        res.writeHead(response.status, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });

        // 5. 核心：将智谱返回的流，原封不动地“流式”转发给前端
        if (response.body) {
          for await (const chunk of response.body) {
            res.write(chunk); // 接收到一块，就立刻写给前端
          }
        }
        res.end();
      } catch (error) {
        // 如果是因为用户中断导致的 fetch 报错，不当作真正的 Error 处理
        if (error.name === 'AbortError') {
           console.log('后端 fetch 已被中止');
        } else {
           console.error('代理层发生真实错误:', error);
           if (!res.headersSent) {
               res.writeHead(500, { 'Access-Control-Allow-Origin': '*' });
               res.end(JSON.stringify({ error: error.message }));
           }
        }
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('✅ 代理服务器已启动: http://localhost:3000');
  console.log('现在你可以去浏览器刷新 index.html 了');
});