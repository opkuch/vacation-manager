import { computed, ref } from 'vue'

export interface PaginationOptions {
  page?: number
  pageSize?: number
}

/** Local page/pageSize state plus helpers driven by a server-provided total. */
export function usePagination(options: PaginationOptions = {}) {
  const page = ref(options.page ?? 1)
  const pageSize = ref(options.pageSize ?? 10)
  const total = ref(0)

  const totalPages = computed(() =>
    pageSize.value > 0 ? Math.max(1, Math.ceil(total.value / pageSize.value)) : 1,
  )
  const hasPrev = computed(() => page.value > 1)
  const hasNext = computed(() => page.value < totalPages.value)

  function setTotal(next: number): void {
    total.value = next
  }

  function goTo(next: number): void {
    page.value = Math.min(Math.max(1, next), totalPages.value)
  }

  function next(): void {
    if (hasNext.value) page.value += 1
  }

  function prev(): void {
    if (hasPrev.value) page.value -= 1
  }

  function reset(): void {
    page.value = 1
  }

  return { page, pageSize, total, totalPages, hasPrev, hasNext, setTotal, goTo, next, prev, reset }
}
