import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/scrollbars.css'
import './style.css'
import 'sarasa-mono-web/index.css'

createApp(App).use(router).mount('#app')
