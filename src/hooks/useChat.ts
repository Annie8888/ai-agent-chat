import { ref } from 'vue';
import { useChatStore } from '../store/chat';
import { fetchChatStream } from '../api/sse';
import type { Message } from '../types/index';

export function useChat() {
  const store = useChatStore();
  const isGenerating = ref(false);
  let currentController: AbortController | null = null;
  
  // 提供给组件的实时渲染文本
  const streamingText = ref('');

  async function sendMessage(question: string) {
    if (!question || isGenerating.value) return;
    const session = store.sessions.find(s => s.id === store.currentSessionId);
    if (!session) return;

    // 1. 推入用户消息
    session.messages.push({ role: 'user', content: question });
    if (session.messages.length === 1) session.title = question.slice(0, 15);
    store.saveData();

    // 2. 准备请求
    const res = await requestAI(session.messages);

    // 4. 结束处理
    session.messages.push({ role: 'assistant', content: res });
    store.saveData();
    isGenerating.value = false;
    currentController = null;
  }
  async function requestAI(messages:Message[]) {
    isGenerating.value = true;
    streamingText.value = '';
    currentController = new AbortController();
    let fullText = '';

    // 3. 调用 API 层
    await fetchChatStream(
      messages,
      (chunk) => {
        fullText += chunk;
        streamingText.value = fullText; // 触发 Vue 响应式更新
      },
      (err) => {
        if (err.name === 'AbortError') {
          fullText += '\n[已中断]';
        } else {
          console.error(err);
          fullText = '请求发生错误。';
        }
      },
      currentController.signal
    );
    return fullText
  }

  function stopGenerate() {
    if (currentController) currentController.abort();
  }
  function startNewChat() {
   
    if (isGenerating.value) {
      stopGenerate();
    }
    
    //清理当前 Hook 内部的流式状态
    streamingText.value = '';
    isGenerating.value = false;

    store.createNewSessions();
  }
  // 重新生成
  async function handleRegenerate(index:number){
    // 如果有在请求中的打断
    stopGenerate();
    // 删掉当前的对话，页面store.sessions
    let session = store.sessions.find(s => s.id === store.currentSessionId);
    if (!session || isGenerating.value) return;
    // store里的数据可以在这直接删除吗
    session.messages = session.messages.slice(0, index);
    // 调用接口重新云兮福
    store.saveData(); // 存一下截断后的状态
     // 3. 准备重新请求
    isGenerating.value = true;
    streamingText.value = '';
    currentController = new AbortController();
     // 4. 调用接口
    const res = await requestAI(session.messages);

    // 5. 把新的回答推入数组
    session.messages.push({ role: 'assistant', content: res });
    store.saveData();
    
    isGenerating.value = false;
    currentController = null;
  }

  return { isGenerating, streamingText, sendMessage, stopGenerate ,startNewChat, handleRegenerate};
}