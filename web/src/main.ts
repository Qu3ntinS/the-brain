import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { installSession } from './composables/useSession'
import './styles/main.css'

const app = createApp(App)

installSession(app)
app.use(router)
app.mount('#app')
