import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { type LoginRequest } from '@vm/shared'
import { useAuthStore } from '@/stores/auth'

/** Thin auth facade combining the session store with router navigation. */
export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  const { user, role, isAuthenticated, isRequester, isValidator, homeRoute } = storeToRefs(store)

  async function login(credentials: LoginRequest): Promise<void> {
    await store.login(credentials)
    await router.replace(store.homeRoute)
  }

  async function logout(): Promise<void> {
    store.logout()
    await router.replace('/login')
  }

  return {
    user,
    role,
    isAuthenticated,
    isRequester,
    isValidator,
    homeRoute,
    login,
    logout,
    restore: store.restore,
  }
}
