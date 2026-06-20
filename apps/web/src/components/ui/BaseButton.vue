<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', type: 'button', disabled: false, loading: false, block: false },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const variantClass = computed<string>(
  () =>
    ({
      primary:
        'bg-primary text-primary-contrast hover:bg-primary-hover border border-transparent',
      secondary: 'bg-surface text-text border border-border hover:bg-surface-muted',
      danger: 'bg-danger text-primary-contrast hover:bg-danger-hover border border-transparent',
      ghost: 'bg-transparent text-muted hover:text-text border border-transparent',
    })[props.variant],
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
      'disabled:cursor-not-allowed disabled:opacity-50',
      variantClass,
      block ? 'w-full' : '',
    ]"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
    <slot />
  </button>
</template>
