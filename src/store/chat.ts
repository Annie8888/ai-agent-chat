// 三个按钮方法
// isGenerating, streamingText
// sessions  currentSessionId 
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Session } from '../types';

const STORAGE_KEY = 'ai_chat_sessions_v2';

export const useChatStore = defineStore('chat', () => {
    const sessions = ref<Session[]>([]);
    const currentSessionId = ref<string | null>(null)

    function initStore() {
        const saved = localStorage.getItem(STORAGE_KEY);
        
        if (saved) {
            try {
                const data = JSON.parse(saved);
                sessions.value = data.sessions || [];
                currentSessionId.value = data.currentSessionId || null;
               
            } catch (e) {
                console.error("读取本地历史失败", e);
            }
        }
        // 没有数据，且没有新对话，新建一个
        if(sessions.value.length === 0 && !getCurrentSession()){
            createNewSessions();
        } 
    }
    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            sessions: sessions.value,
            currentSessionId: currentSessionId.value
        }));
    }
    // 新建会话
    function createNewSessions() {
        // 没有的话新建id 放到sessions 里面，id ，title赋值，
        // const newId = Date.now().toString();
        const newId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        sessions.value.push({ id: newId, title: '新的对话',  messages: []})
        currentSessionId.value = newId
        saveData()
    }
    // 辅助函数：获取当前活跃的会话对象
    function getCurrentSession() {
        return sessions.value.find(s => s.id === currentSessionId.value);
    }

    return { sessions, currentSessionId, initStore, saveData, createNewSessions };
})









