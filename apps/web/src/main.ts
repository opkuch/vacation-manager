import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/main.css'
import App from './App.vue'
import { router } from './router'
import { useTheme } from './composables/useTheme'
import { useAuthStore } from './stores/auth'
import { setUnauthorizedHandler } from './lib/axios'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

useTheme().init()

// A 401 from any request clears the session and bounces to login.
const auth = useAuthStore()
setUnauthorizedHandler(() => {
  auth.logout()
  void router.replace('/login')
})

app.mount('#app')
