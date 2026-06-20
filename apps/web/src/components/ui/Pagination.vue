<script setup lang="ts">
import BaseButton from './BaseButton.vue'

const props = defineProps<{
  page: number
  totalPages: number
  total: number
}>()

const emit = defineEmits<{ change: [page: number] }>()

function go(next: number): void {
  if (next >= 1 && next <= props.totalPages && next !== props.page) emit('change', next)
}
</script>

<template>
  <div class="flex items-center justify-between gap-3 text-sm text-muted">
    <span>{{ total }} total</span>
    <div class="flex items-center gap-2">
      <BaseButton variant="secondary" :disabled="page <= 1" @click="go(page - 1)">Prev</BaseButton>
      <span class="px-2 text-text">Page {{ page }} / {{ Math.max(totalPages, 1) }}</span>
      <BaseButton variant="secondary" :disabled="page >= totalPages" @click="go(page + 1)">
        Next
      </BaseButton>
    </div>
  </div>
</template>
