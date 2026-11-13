// src/utils/markdown.test.ts
import { describe, it, expect } from 'vitest';
import { formatStreamingMarkdown } from './markdown';

describe('formatStreamingMarkdown', () => {
  it('应该原样返回普通文本', () => {
    const input = '这是普通文本';
    const result = formatStreamingMarkdown(input);
    expect(result).toBe('这是普通文本');
  });

  it('如果没有闭合的代码块，应该在末尾补齐 ```', () => {
    // 模拟流式输出中，只输出了前半截
    const input = '这是一段代码：\n```javascript\nconsole.log("hello");';
    const result = formatStreamingMarkdown(input);
    // 期望它自动补上结尾
    expect(result).toContain('```javascript');
    expect(result.endsWith('```')).toBe(true);
  });

  it('如果代码块已经闭合，不应该重复添加', () => {
    const input = '这是一段代码：\n```javascript\nconsole.log("hello");\n```';
    const result = formatStreamingMarkdown(input);
    // 查找 ``` 出现的次数，应该是 2 次，不能变成 4 次
    const matches = result.match(/```/g);
    expect(matches?.length).toBe(2);
  });
});