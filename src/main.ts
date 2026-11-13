import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App) // 创建 Vue 应用实例

const pinia = createPinia()
app.use(pinia) 

app.mount('#app') // 最后挂载到 DOM