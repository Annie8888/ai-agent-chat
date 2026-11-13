// 处理流式 Markdown 的半截语法问题
export function formatStreamingMarkdown(text:string):string {
    // 如果包含 ``` 且数量是奇数，说明代码块没闭合，我们在末尾补一个
    const codeBlockCount = (text.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
        return text + '\n```';
    }
    return text;
}