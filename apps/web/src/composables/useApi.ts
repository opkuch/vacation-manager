import { ref, shallowRef } from 'vue'
import { normalizeError, type NormalizedError } from '@/lib/errors'

/**
 * Wraps an async API call with loading/error/data state and uniform error
 * normalization. Returns the result (or null on failure) so callers can branch.
 */
export function useApi<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const loading = ref(false)
  const error = ref<NormalizedError | null>(null)
  const data = shallowRef<TResult | null>(null)

  async function execute(...args: TArgs): Promise<TResult | null> {
    loading.value = true
    error.value = null
    try {
      const result = await fn(...args)
      data.value = result
      return result
    } catch (err) {
      error.value = normalizeError(err)
      return null
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    error.value = null
  }

  return { loading, error, data, execute, reset }
}
