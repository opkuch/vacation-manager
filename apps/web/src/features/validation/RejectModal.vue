<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps<{ open: boolean; loading?: boolean; error?: string | null }>()
const emit = defineEmits<{ confirm: [comment: string]; close: [] }>()

const comment = ref('')

// Reset the field each time the modal opens.
watch(
  () => props.open,
  (open) => {
    if (open) comment.value = ''
  },
)

// Mirrors REJECTION_COMMENT_REQUIRED: cannot reject without a reason.
const canConfirm = computed(() => comment.value.trim().length > 0)

function onConfirm(): void {
  if (canConfirm.value) emit('confirm', comment.value.trim())
}
</script>

<template>
  <BaseModal :open="open" title="Reject request" @close="emit('close')">
    <label class="flex flex-col gap-1">
      <span class="text-sm font-medium text-text">Rejection comment <span class="text-danger">*</span></span>
      <textarea
        v-model="comment"
        rows="3"
        placeholder="Explain why this request is rejected…"
        class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-primary"
      />
    </label>
    <p v-if="error" class="mt-2 text-xs text-danger">{{ error }}</p>

    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
      <BaseButton
        variant="danger"
        :disabled="!canConfirm"
        :loading="loading"
        @click="onConfirm"
      >
        Reject
      </BaseButton>
    </template>
  </BaseModal>
</template>
