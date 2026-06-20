<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { type CreateVacationRequest } from '@vm/shared'
import { useRequestsStore } from '@/stores/requests'
import { useApi } from '@/composables/useApi'
import { usePagination } from '@/composables/usePagination'
import BaseCard from '@/components/ui/BaseCard.vue'
import Pagination from '@/components/ui/Pagination.vue'
import RequestForm from './RequestForm.vue'
import RequestList from './RequestList.vue'

const store = useRequestsStore()
const { mine } = storeToRefs(store)
const { page, pageSize, totalPages, setTotal, goTo } = usePagination({ pageSize: 10 })

const list = useApi(store.fetchMine)
const create = useApi(store.createMine)
const formRef = useTemplateRef<InstanceType<typeof RequestForm>>('form')

async function load(): Promise<void> {
  await list.execute({ page: page.value, pageSize: pageSize.value })
  setTotal(mine.value.total)
}

async function onSubmit(payload: CreateVacationRequest): Promise<void> {
  const ok = await create.execute(payload)
  if (ok !== null) {
    toast.success('Request submitted.')
    formRef.value?.resetForm()
    goTo(1)
    await load()
  }
}

function onPageChange(next: number): void {
  goTo(next)
  void load()
}

onMounted(load)

watch(() => mine.value.total, setTotal)
</script>

<template>
  <div class="flex flex-col gap-6">
    <header>
      <h1 class="font-display text-xl font-semibold text-text">My Requests</h1>
      <p class="text-sm text-muted">Submit a new vacation request and track its status.</p>
    </header>

    <BaseCard title="New request">
      <RequestForm
        ref="form"
        :loading="create.loading.value"
        :server-error="create.error.value"
        @submit="onSubmit"
      />
    </BaseCard>

    <div class="flex flex-col gap-3">
      <RequestList :requests="mine.data" :loading="list.loading.value" />
      <Pagination
        :page="page"
        :total-pages="totalPages"
        :total="mine.total"
        @change="onPageChange"
      />
    </div>
  </div>
</template>
