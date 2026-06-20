<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-lg border border-border bg-surface shadow-lg">
        <header
          v-if="title"
          class="flex items-center justify-between border-b border-border px-5 py-3"
        >
          <h2 class="text-lg font-semibold text-text">{{ title }}</h2>
          <button
            class="text-muted transition-colors hover:text-text"
            aria-label="Close"
            @click="emit('close')"
          >
            &times;
          </button>
        </header>
        <div class="px-5 py-4">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="flex justify-end gap-2 border-t border-border px-5 py-3">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>
