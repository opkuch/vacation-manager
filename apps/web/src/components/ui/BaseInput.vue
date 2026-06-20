<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    type?: string
    placeholder?: string
    error?: string
    required?: boolean
    autocomplete?: string
  }>(),
  { type: 'text', required: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <label class="flex flex-col gap-1">
    <span v-if="label" class="text-sm font-medium text-text">
      {{ label }}<span v-if="required" class="text-danger"> *</span>
    </span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      :aria-invalid="Boolean(error)"
      class="w-full rounded-md border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-primary"
      :class="error ? 'border-danger' : 'border-border'"
      @input="onInput"
    />
    <span v-if="error" class="text-xs text-danger">{{ error }}</span>
  </label>
</template>
