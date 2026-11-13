// src/store/chat.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChatStore } from './chat';

describe('Chat Store', () => {
  // ⭐️ 每次测试前，都要创建一个全新的 Pinia 实例，防止测试数据互相污染
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear(); // 清空本地存储
  });

  it('初始化时，如果没有数据应该默认新建一个会话', () => {
    const store = useChatStore();
    store.initStore(); // 调用你的初始化方法
    
    expect(store.sessions.length).toBe(1);
    expect(store.currentSessionId).not.toBeNull();
    expect(store.sessions[0].title).toBe('新的对话');
  });

  it('调用 createNewSessions 后，应该新增一个会话并切换过去', () => {
    const store = useChatStore();
    store.initStore(); // 先初始化出一个
    
    const oldId = store.currentSessionId;
    store.createNewSessions(); // 再建一个
    
    expect(store.sessions.length).toBe(2);
    expect(store.currentSessionId).not.toBe(oldId); // 当前 ID 应该变了
  });
});