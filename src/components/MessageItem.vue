<template>
  <div :class="['message', role]">
    <div v-if="role === 'assistant'" v-html="parsedContent"></div>
    <div v-else>{{ content }}</div>
    <div v-if="role === 'assistant' && !isGenerating" class="action-bar">
        <span @click="emit('regenerate', index)">🔄 重新生成</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { formatStreamingMarkdown } from '../utils/markdown';

const props = defineProps<{ 
  role: string;
  content: string;
  index?: number;
  isGenerating?: boolean;
}>();
const emit = defineEmits(['regenerate'])

const parsedContent = computed(() => {
  if (props.role !== 'assistant') return '';
  const safeText = formatStreamingMarkdown(props.content);
  return DOMPurify.sanitize(marked.parse(safeText) as string);
});
</script>
<style scoped>
.message { 
    max-width: 80%; 
    padding: 10px 15px; 
    border-radius: 8px; 
    line-height: 1.5; 
    margin-bottom: 10px;
    word-wrap: break-word;
}
.message.user { 
    align-self: flex-end; 
    background: #1ce78d; 
}
.message.assistant { 
    align-self: flex-start; 
    background: #fafafa; 
    width: 80%; 
    max-width: 80%; 
}
/* 确保 Markdown 渲染出来的代码块、段落有正常间距 */
.message :deep(p) { margin: 0 0 10px 0; }
.message :deep(pre) { background: #2d2d2d; color: #fff; padding: 10px; border-radius: 5px; overflow-x: auto; }
.action-bar {
   margin-top: 10px;
   text-align: left; 
   cursor: pointer;
   font-size: 12px;
   float: right;
}
</style>