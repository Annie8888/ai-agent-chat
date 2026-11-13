// src/api/sse.ts
export async function fetchChatStream(
  messages: any[],
  onMessage: (text: string) => void,
  onError: (err: any) => void,
  signal: AbortSignal
) {
  const API_URL = 'http://localhost:3000/api/chat';
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: '大模型的名字', messages, stream: true }),
      signal
    });

    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; 

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(line.slice(6));
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onMessage(content); // 回调给业务层
          } catch (e) { /* 忽略解析错误 */ }
        }
      }
    }
  } catch (error) {
    onError(error);
  }
}