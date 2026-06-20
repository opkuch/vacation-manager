<script setup lang="ts">
import { reactive, ref } from 'vue'
import { LoginRequestSchema } from '@vm/shared'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'
import { useTheme } from '@/composables/useTheme'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const { login } = useAuth()
const { theme, toggle } = useTheme()
const { loading, error, execute, reset } = useApi(login)

const form = reactive({ email: '', password: '' })
const fieldErrors = ref<{ email?: string; password?: string }>({})

async function onSubmit(): Promise<void> {
  reset()
  fieldErrors.value = {}

  const parsed = LoginRequestSchema.safeParse(form)
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    fieldErrors.value = { email: flat.email?.[0], password: flat.password?.[0] }
    return
  }

  await execute(parsed.data)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-text">Vacation Manager</h1>
        <button
          class="rounded-md border border-border px-2 py-1.5 text-sm text-muted transition-colors hover:text-text"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
          @click="toggle"
        >
          {{ theme === 'dark' ? '☀︎' : '☾' }}
        </button>
      </div>

      <BaseCard title="Sign in">
        <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
          <BaseInput
            v-model="form.email"
            label="Email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
            :error="fieldErrors.email"
          />
          <BaseInput
            v-model="form.password"
            label="Password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
            :error="fieldErrors.password"
          />

          <p v-if="error" class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {{ error.message }}
          </p>

          <BaseButton type="submit" block :loading="loading">Sign in</BaseButton>
        </form>
      </BaseCard>
    </div>
  </div>
</template>
