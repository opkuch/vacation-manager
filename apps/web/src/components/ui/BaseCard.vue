<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="rounded-lg border border-border bg-surface shadow-sm">
    <header v-if="title || $slots.header" class="border-b border-border px-5 py-3">
      <slot name="header">
        <h2 class="text-lg font-semibold text-text">{{ title }}</h2>
      </slot>
    </header>
    <div class="px-5 py-4">
      <slot />
    </div>
  </section>
</template>
