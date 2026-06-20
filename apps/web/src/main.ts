import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/main.css'
import './styles/toast.css'
import App from './App.vue'
import { router } from './router'
import { useTheme } from './composables/useTheme'
import { useRealtime } from './composables/useRealtime'
import { useAuthStore } from './stores/auth'
import { setUnauthorizedHandler } from './lib/axios'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

useTheme().init()

const auth = useAuthStore()

setUnauthorizedHandler(() => {
  void auth.logout().finally(() => {
    void router.replace('/login')
  })
})

async function bootstrap(): Promise<void> {
  await router.isReady()
  await auth.restore()
  app.mount('#app')
  useRealtime().connect()
}

void bootstrap()
