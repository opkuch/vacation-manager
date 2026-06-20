<script setup lang="ts">
import { computed } from 'vue'
import { VacationStatus, type VacationStatus as Status, type VacationRequestDto } from '@vm/shared'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps<{
  status: Status | ''
  userId: string
  requests: VacationRequestDto[]
}>()

const emit = defineEmits<{
  'update:status': [value: Status | '']
  'update:userId': [value: string]
}>()

const statusOptions = [
  { value: VacationStatus.Pending, label: 'Pending' },
  { value: VacationStatus.Approved, label: 'Approved' },
  { value: VacationStatus.Rejected, label: 'Rejected' },
]

// Build the user filter from the rows currently in view (denormalized userName).
const userOptions = computed(() => {
  const seen = new Map<string, string>()
  for (const r of props.requests) seen.set(r.userId, r.userName)
  return Array.from(seen, ([value, label]) => ({ value, label }))
})
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
    <BaseSelect
      :model-value="status"
      label="Status"
      placeholder="All statuses"
      :options="statusOptions"
      @update:model-value="emit('update:status', $event as Status | '')"
    />
    <BaseSelect
      :model-value="userId"
      label="Employee"
      placeholder="All employees"
      :options="userOptions"
      @update:model-value="emit('update:userId', $event)"
    />
  </div>
</template>
