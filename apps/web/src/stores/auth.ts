import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { Role, type LoginRequest, type UserDto } from '@vm/shared'
import { api } from '@/lib/api'

/**
 * Authentication session backed by an httpOnly cookie. The browser stores the JWT;
 * Pinia holds only the loaded user profile and role helpers.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserDto | null>(null)

  const isAuthenticated = computed(() => Boolean(user.value))
  const role = computed(() => user.value?.role ?? null)
  const isRequester = computed(() => role.value === Role.Requester)
  const isValidator = computed(() => role.value === Role.Validator)

  /** Where to land after login, based on role. */
  const homeRoute = computed(() => (isValidator.value ? '/validation' : '/requests'))

  async function login(credentials: LoginRequest): Promise<void> {
    const { user: nextUser } = await api.login(credentials)
    user.value = nextUser
  }

  /** Re-hydrates the user from the session cookie (survives page refresh). */
  let pendingRestore: Promise<void> | null = null

  async function restore(): Promise<void> {
    if (user.value) return
    if (pendingRestore) return pendingRestore

    pendingRestore = (async () => {
      try {
        user.value = await api.me({ silent: true })
      } catch {
        clearSession()
      } finally {
        pendingRestore = null
      }
    })()

    return pendingRestore
  }

  function clearSession(): void {
    user.value = null
  }

  async function logout(): Promise<void> {
    clearSession()
    try {
      await api.logout({ silent: true })
    } catch {
      // Cookie may already be cleared.
    }
  }

  return {
    user,
    isAuthenticated,
    role,
    isRequester,
    isValidator,
    homeRoute,
    login,
    restore,
    clearSession,
    logout,
  }
})
