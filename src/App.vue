<template>
    <div class="app-container">
    <!-- 左侧对话栏 -->
        <div class="sidebar">
            <button class="new-chat-btn" @click="startNewChat">+ 新建对话</button>
            <ul class="session-list">
                <li 
                    v-for="item in reversedSessions" 
                    :key="item.id" 
                    @click="store.currentSessionId = item.id"
                    class="session-item"
                >
                    {{ item.title }}
                </li>
            </ul>
        </div>
        
        <!-- 右侧聊天界面 -->
        <div class="main-content">
              <div class="chat-box" ref="chatBoxRef" @scroll="handleScroll">
                <!-- 渲染历史消息 -->
                <MessageItem 
                    v-for="(msg, idx) in currentSession?.messages" 
                    :key="idx" 
                    :role="msg.role" 
                    :content="msg.content" 
                    :index="idx"
                    :is-generrating="isGenerating"
                    @regenerate="handleRegenerate"
                />
                <!-- 渲染正在生成的消息（流式） -->
                <MessageItem 
                    v-if="isGenerating" 
                    role="assistant" 
                    :content="streamingText" 
                    :is-generating="true">
                </MessageItem>
               
            </div>
            
            <InputArea 
                :is-generating="isGenerating" 
                @send="sendMessage" 
                @stop="stopGenerate" 
            />

              <!-- ⭐️ 新增：回到底部悬浮按钮 -->
            <button 
                v-show="!isAutoScroll" 
                @click="scrollToBottom"
                class="scroll-bottom-btn"
            >
                ⬇️ 回到底部
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useChatStore } from './store/chat';
import { useChat } from './hooks/useChat';
import MessageItem from './components/MessageItem.vue';
import InputArea from './components/InputArea.vue';

const store = useChatStore();
const { isGenerating, streamingText, sendMessage, stopGenerate, startNewChat, handleRegenerate } = useChat();

const currentSession = computed(() => 
    store.sessions.find(s => s.id === store.currentSessionId)
);
const reversedSessions = computed(() => {
  return [...store.sessions].reverse();
});
// 1. 获取聊天容器的 DOM 引用
const chatBoxRef = ref<HTMLElement | null>(null);

// 2. ⭐️ 核心：定义一个开关，默认是开启自动滚动的
const isAutoScroll = ref(true);

// 3. 滚动到底部的方法
const scrollToBottom = async () => {
  await nextTick(); // 等 Vue 把新消息渲染到 DOM 上
  if (chatBoxRef.value) {
    chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
  }
};

// 4. ⭐️ 监听用户滚动事件
const handleScroll = () => {
  if (!chatBoxRef.value) return;
  const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.value;
  
  // 判断用户是否在底部附近（距离底部小于 50px 就算在底部）
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
  
  // 如果在底部，就开启自动滚动；如果往上翻了，就关闭自动滚动
  isAutoScroll.value = isAtBottom;
};

// 5. ⭐️ 核心监控：当消息增加，或者流式文字更新时
watch(
  () => [currentSession.value?.messages.length, streamingText.value],
  () => {
    // 只有当开关开着的时候，才强制滚到底部
    if (isAutoScroll.value) {
      scrollToBottom();
    }
  },
  { deep: true }
);

onMounted(() => {
  store.initStore();
  scrollToBottom();
});

</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>

<style scoped>
.app-container {
  display: flex;
  height: 100%; /* 继承 #app 的 100vh */
  width: 100%;
}

/* 左侧栏：固定宽度 */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #202123;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 10px;
  height: 100%;
  box-sizing: border-box;
}

/* 右侧聊天区：占据剩下的所有空间 */
.main-content {
  flex: 1; /* ⭐️ 核心：占满剩余空间 */
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100%;
  min-width: 0; /* 防止内部长文本撑爆容器 */
}

/* 聊天列表滚动区 */
.chat-box {
  flex: 1; /* 占据除了输入框以外的所有高度 */
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 左侧按钮和列表样式 */
.new-chat-btn {
  padding: 10px;
  background: #19c37d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: bold;
}
.new-chat-btn:hover { background: #1a885d; }

.session-list {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}
.session-item {
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
  cursor: pointer;
  word-break: break-all;
  font-size: 14px;
  background: #2a2b32;
}
.session-item:hover { background: #343541; }
.session-item.active { background: #343541; border-left: 3px solid #19c37d; }

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  position: relative; /* ⭐️ 关键：为了给悬浮按钮做定位参考 */
}

/* 回到底部的按钮样式 */
.scroll-bottom-btn {
  position: absolute;
  bottom: 100px; /* 距离底部的高度，根据输入框高度调整 */
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  z-index: 10;
}
.scroll-bottom-btn:hover {
  background: #f9fafb;
}
</style>