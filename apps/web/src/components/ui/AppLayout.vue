<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import BaseButton from './BaseButton.vue'

const { user, role, isRequester, isValidator, logout } = useAuth()
const { theme, toggle } = useTheme()

interface NavItem {
  to: string
  label: string
}

// Role-gated primary navigation; Team Planning is shared by both roles.
const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = []
  if (isRequester.value) items.push({ to: '/requests', label: 'My Requests' })
  if (isValidator.value) items.push({ to: '/validation', label: 'Dashboard' })
  items.push({ to: '/team', label: 'Team Planning' })
  return items
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b border-border/70 bg-surface/90 backdrop-blur-sm">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
        <span class="font-display text-lg font-semibold text-text">Vacation Manager</span>
        <nav class="flex flex-1 flex-wrap items-center gap-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-text"
            active-class="bg-surface-muted !text-text"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <div class="flex items-center gap-3">
          <button
            class="rounded-md border border-border px-2 py-1.5 text-sm text-muted transition-colors hover:text-text"
            :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
            @click="toggle"
          >
            {{ theme === 'dark' ? '☀︎' : '☾' }}
          </button>
          <div v-if="user" class="hidden text-right sm:block">
            <div class="text-sm font-medium text-text">{{ user.name }}</div>
            <div class="text-xs text-muted">{{ role }}</div>
          </div>
          <BaseButton variant="ghost" @click="logout">Logout</BaseButton>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
