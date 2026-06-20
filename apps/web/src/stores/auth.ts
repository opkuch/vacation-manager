import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { Role, type LoginRequest, type UserDto } from '@vm/shared'
import { api } from '@/lib/api'
import { getStoredToken, setStoredToken } from '@/lib/axios'

/**
 * Authentication session: the JWT (persisted in localStorage) and the current
 * user. Authorization (role checks) is exposed as derived helpers, kept separate
 * from identity per project conventions.
 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getStoredToken())
  const user = ref<UserDto | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))
  const role = computed(() => user.value?.role ?? null)
  const isRequester = computed(() => role.value === Role.Requester)
  const isValidator = computed(() => role.value === Role.Validator)

  /** Where to land after login, based on role. */
  const homeRoute = computed(() => (isValidator.value ? '/validation' : '/requests'))

  function setSession(nextToken: string, nextUser: UserDto): void {
    token.value = nextToken
    user.value = nextUser
    setStoredToken(nextToken)
  }

  async function login(credentials: LoginRequest): Promise<void> {
    const { token: nextToken, user: nextUser } = await api.login(credentials)
    setSession(nextToken, nextUser)
  }

  /** Re-hydrates the user from a persisted token on app start. */
  async function restore(): Promise<void> {
    if (!token.value || user.value) return
    user.value = await api.me()
  }

  function logout(): void {
    token.value = null
    user.value = null
    setStoredToken(null)
  }

  return {
    token,
    user,
    isAuthenticated,
    role,
    isRequester,
    isValidator,
    homeRoute,
    login,
    restore,
    logout,
  }
})
