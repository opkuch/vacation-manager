<script setup lang="ts">
interface Option {
  value: string
  label: string
}

defineProps<{
  modelValue: string
  options: Option[]
  label?: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onChange(event: Event): void {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <label class="flex flex-col gap-1">
    <span v-if="label" class="text-sm font-medium text-text">{{ label }}</span>
    <select
      :value="modelValue"
      class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary"
      @change="onChange"
    >
      <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </label>
</template>
