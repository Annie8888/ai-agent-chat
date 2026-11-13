<template>
  <div class="input-area">
    <div class="input-wrapper">
      <textarea 
        v-model="inputText" 
        @keydown.enter.prevent="handleSend"
        placeholder="给 AI 发送消息..."
      ></textarea>
      
      <button v-if="!isGenerating" @click="handleSend">↑</button>
      <button v-else @click="emit('stop')">■</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ isGenerating: boolean }>();
const emit = defineEmits(['send', 'stop']);
const inputText = ref('');

function handleSend() {
  if (!inputText.value) return;
  emit('send', inputText.value);
  inputText.value = '';
}
</script>
<style scoped>
.input-area { 
    padding: 20px 0 30px 0; 
    display: flex;
    justify-content: center;
    width: 100%;
}

.input-wrapper {
    display: flex;
    align-items: flex-end;
    background: #ffffff;
    border-radius: 24px;
    padding: 8px 12px 8px 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 80%;
    max-width: 800px;
}

.input-wrapper:focus-within {
    border-color: #19c37d;
    box-shadow: 0 4px 15px rgba(25, 195, 125, 0.15);
}

textarea {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 15px;
    line-height: 1.5;
    resize: none;
    max-height: 200px;
    padding: 6px 0;
    font-family: inherit;
    color: #333;
}

textarea::placeholder { color: #9ca3af; }

button {
    background: #19c37d;
    color: white;
    border: none;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-left: 10px;
    font-size: 18px;
    transition: all 0.2s;
    flex-shrink: 0;
}

button:hover { background: #1a885d; transform: scale(1.05); }
button:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; transform: none; }
</style>