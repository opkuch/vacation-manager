<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { VacationStatus, type VacationRequestDto } from '@vm/shared'
import { useRequestsStore } from '@/stores/requests'
import { useApi } from '@/composables/useApi'
import BaseCard from '@/components/ui/BaseCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const store = useRequestsStore()
const { team } = storeToRefs(store)
const list = useApi(store.fetchTeam)

// Team planning surfaces only Pending/Approved (the API already scopes this).
const groups = computed(() => {
  const buckets: Record<string, VacationRequestDto[]> = {
    [VacationStatus.Pending]: [],
    [VacationStatus.Approved]: [],
  }
  for (const req of team.value.data) {
    if (req.status === VacationStatus.Pending || req.status === VacationStatus.Approved) {
      buckets[req.status]?.push(req)
    }
  }
  return buckets
})

function formatRange(req: VacationRequestDto): string {
  return req.startDate === req.endDate ? req.startDate : `${req.startDate} → ${req.endDate}`
}

onMounted(() => list.execute({ page: 1, pageSize: 50 }))
</script>

<template>
  <div class="flex flex-col gap-6">
    <header>
      <h1 class="font-display text-xl font-semibold text-text">Team Planning</h1>
      <p class="text-sm text-muted">Upcoming and pending time off across the team.</p>
    </header>

    <p v-if="list.error.value" class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
      {{ list.error.value.message }}
    </p>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <BaseCard
        v-for="status in [VacationStatus.Approved, VacationStatus.Pending]"
        :key="status"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <StatusBadge :status="status" />
            <span class="text-sm text-muted">{{ groups[status]?.length ?? 0 }}</span>
          </div>
        </template>

        <ul v-if="(groups[status]?.length ?? 0) > 0" class="flex flex-col gap-2">
          <li
            v-for="req in groups[status]"
            :key="req.id"
            class="flex items-center justify-between rounded-md border border-border px-3 py-2"
          >
            <span class="font-medium text-text">{{ req.userName }}</span>
            <span class="text-sm text-muted">{{ formatRange(req) }}</span>
          </li>
        </ul>
        <p v-else class="text-sm text-muted">Nothing here yet.</p>
      </BaseCard>
    </div>
  </div>
</template>
