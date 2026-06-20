<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  type ListRequestsQuery,
  type VacationRequestDto,
  type VacationStatus as Status,
} from '@vm/shared'
import { useRequestsStore } from '@/stores/requests'
import { useApi } from '@/composables/useApi'
import { usePagination } from '@/composables/usePagination'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import RequestFilters from './RequestFilters.vue'
import RejectModal from './RejectModal.vue'

const store = useRequestsStore()
const { all } = storeToRefs(store)
const { page, pageSize, totalPages, setTotal, goTo } = usePagination({ pageSize: 10 })

const filters = reactive<{ status: Status | ''; userId: string }>({ status: '', userId: '' })

const list = useApi(store.fetchAll)
const approveApi = useApi(store.approve)
const rejectApi = useApi(store.reject)

const rejecting = ref<VacationRequestDto | null>(null)

const columns = [
  { key: 'userName', label: 'Employee' },
  { key: 'startDate', label: 'Start' },
  { key: 'endDate', label: 'End' },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

async function load(): Promise<void> {
  const query: ListRequestsQuery = {
    page: page.value,
    pageSize: pageSize.value,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
  }
  await list.execute(query)
  setTotal(all.value.total)
}

function onFiltersChange(): void {
  goTo(1)
  void load()
}

function onPageChange(next: number): void {
  goTo(next)
  void load()
}

async function onApprove(request: VacationRequestDto): Promise<void> {
  const ok = await approveApi.execute(request.id)
  if (ok) await load()
}

function openReject(request: VacationRequestDto): void {
  rejectApi.reset()
  rejecting.value = request
}

async function onRejectConfirm(comment: string): Promise<void> {
  if (!rejecting.value) return
  const ok = await rejectApi.execute(rejecting.value.id, comment)
  if (ok) {
    rejecting.value = null
    await load()
  }
}

onMounted(load)
</script>

<template>
  <div class="flex flex-col gap-6">
    <header>
      <h1 class="text-xl font-semibold text-text">Validation Dashboard</h1>
      <p class="text-sm text-muted">Review, approve, and reject vacation requests.</p>
    </header>

    <BaseCard>
      <RequestFilters
        v-model:status="filters.status"
        v-model:user-id="filters.userId"
        :requests="all.data"
        @update:status="onFiltersChange"
        @update:user-id="onFiltersChange"
      />
    </BaseCard>

    <p v-if="approveApi.error.value" class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
      {{ approveApi.error.value.message }}
    </p>

    <div class="flex flex-col gap-3">
      <BaseTable
        :columns="columns"
        :rows="all.data"
        :loading="list.loading.value"
        empty-text="No requests match these filters."
      >
        <template #cell="{ row, column }">
          <StatusBadge v-if="column.key === 'status'" :status="row.status" />
          <span v-else-if="column.key === 'reason'" class="text-muted">{{ row.reason ?? '—' }}</span>
          <div v-else-if="column.key === 'actions'" class="flex gap-2">
            <template v-if="row.status === 'Pending'">
              <BaseButton variant="primary" :loading="approveApi.loading.value" @click="onApprove(row)">
                Approve
              </BaseButton>
              <BaseButton variant="danger" @click="openReject(row)">Reject</BaseButton>
            </template>
            <span v-else class="text-xs text-muted">—</span>
          </div>
          <span v-else>{{ row[column.key as 'userName' | 'startDate' | 'endDate'] }}</span>
        </template>
      </BaseTable>

      <Pagination :page="page" :total-pages="totalPages" :total="all.total" @change="onPageChange" />
    </div>

    <RejectModal
      :open="rejecting !== null"
      :loading="rejectApi.loading.value"
      :error="rejectApi.error.value?.message ?? null"
      @confirm="onRejectConfirm"
      @close="rejecting = null"
    />
  </div>
</template>
