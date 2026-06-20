<script setup lang="ts">
import { type VacationRequestDto } from '@vm/shared'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{ requests: VacationRequestDto[]; loading?: boolean }>()

const columns = [
  { key: 'startDate', label: 'Start' },
  { key: 'endDate', label: 'End' },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status' },
  { key: 'comments', label: 'Comments' },
]
</script>

<template>
  <BaseTable
    :columns="columns"
    :rows="requests"
    :loading="loading"
    empty-text="You have no vacation requests yet."
  >
    <template #cell="{ row, column }">
      <StatusBadge v-if="column.key === 'status'" :status="row.status" />
      <span v-else-if="column.key === 'reason'" class="text-muted">{{ row.reason ?? '—' }}</span>
      <span v-else-if="column.key === 'comments'" class="text-muted">{{ row.comments ?? '—' }}</span>
      <span v-else>{{ row[column.key as 'startDate' | 'endDate'] }}</span>
    </template>
  </BaseTable>
</template>
