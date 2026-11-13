# AI 智能对话工作台 (Vue3 + TypeScript)

基于大模型 API 构建的流式对话应用，经历了从原生 JS 验证底层逻辑，到 Vue3 + TS 工程化重构的完整演进。

## ✨ 核心功能
- **全链路流式渲染**：基于 Fetch + ReadableStream 手写 SSE 解析，处理半包/粘包，实现打字机效果。
- **级联中断机制**：前端 AbortController 结合 Node 代理层，实现点击停止后的双重网络断开，节约 Token。
- **Markdown 渲染与防 XSS**：引入 marked + DOMPurify，流式输出时自动闭合半截语法，防御脚本注入。
- **智能滚动锁定**：自动识别用户是否在查看历史记录，智能控制滚动条，支持“回到底部”。
- **重新生成**：支持切断上下文并重新向大模型发起请求。
- **工程化与测试**：集成 Vitest + JSDOM，对核心流式解析函数和 Pinia 状态管理编写了完整的单元测试。

## 🛠️ 技术栈
- **前端**：Vue3 (Composition API), TypeScript, Pinia, Vite
- **后端代理**：Node.js (原生 http 模块)
- **测试**：Vitest, JSDOM
- **工具库**：Marked, DOMPurify

## 📦 本地运行
1. 安装依赖：`npm install`
2. 启动 Node 代理层：`node server/index.js` (请确保在 server 目录下配置了你的 API Key)
3. 启动前端项目：`npm run dev`
4. 运行单元测试：`npm run test`

src/
├── api/          # 网络请求（SSE 解析）
├── components/   # UI 组件
├── hooks/        # 核心业务逻辑（useChat）
├── store/        # 全局状态（Pinia）
├── types/        # TS 类型定义
├── utils/        # 工具函数（Markdown、防抖等）
├── App.vue
└── main.ts
