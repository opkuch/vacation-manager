<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { CreateVacationRequestSchema, type CreateVacationRequest } from '@vm/shared'
import type { NormalizedError } from '@/lib/errors'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps<{
  loading?: boolean
  serverError?: NormalizedError | null
}>()

const emit = defineEmits<{ submit: [payload: CreateVacationRequest] }>()

type FieldKey = 'startDate' | 'endDate' | 'reason'

const form = reactive({ startDate: '', endDate: '', reason: '' })
const fieldErrors = ref<Partial<Record<FieldKey, string>>>({})
const formError = ref<string | null>(null)

// Surface server business-rule errors (OVERLAP_CONFLICT/PAST_DATE/…) on the
// mapped field, falling back to a form-level message.
watch(
  () => props.serverError,
  (err) => {
    if (!err) return
    if (err.field) fieldErrors.value = { ...fieldErrors.value, [err.field]: err.message }
    else formError.value = err.message
  },
)

function onSubmit(): void {
  fieldErrors.value = {}
  formError.value = null

  const candidate = {
    startDate: form.startDate,
    endDate: form.endDate,
    reason: form.reason.trim() === '' ? null : form.reason.trim(),
  }

  const parsed = CreateVacationRequestSchema.safeParse(candidate)
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    fieldErrors.value = {
      startDate: flat.startDate?.[0],
      endDate: flat.endDate?.[0],
      reason: flat.reason?.[0],
    }
    return
  }

  emit('submit', parsed.data)
}

function resetForm(): void {
  form.startDate = ''
  form.endDate = ''
  form.reason = ''
  fieldErrors.value = {}
  formError.value = null
}

defineExpose({ resetForm })
</script>

<template>
  <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" novalidate @submit.prevent="onSubmit">
    <BaseInput
      v-model="form.startDate"
      label="Start date"
      type="date"
      required
      :error="fieldErrors.startDate"
    />
    <BaseInput
      v-model="form.endDate"
      label="End date"
      type="date"
      required
      :error="fieldErrors.endDate"
    />
    <div class="sm:col-span-2">
      <BaseInput v-model="form.reason" label="Reason (optional)" :error="fieldErrors.reason" />
    </div>

    <p
      v-if="formError"
      class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger sm:col-span-2"
    >
      {{ formError }}
    </p>

    <div class="sm:col-span-2">
      <BaseButton type="submit" :loading="loading">Submit request</BaseButton>
    </div>
  </form>
</template>
