<script setup lang="ts">
import { computed } from 'vue'
import { VacationStatus, type VacationStatus as Status } from '@vm/shared'

const props = defineProps<{ status: Status }>()

const styles = computed<string>(
  () =>
    ({
      [VacationStatus.Pending]: 'bg-warning-soft text-warning',
      [VacationStatus.Approved]: 'bg-success-soft text-success',
      [VacationStatus.Rejected]: 'bg-danger-soft text-danger',
    })[props.status],
)
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="styles"
  >
    {{ status }}
  </span>
</template>
