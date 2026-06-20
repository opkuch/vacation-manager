import { ref } from 'vue'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'vm.theme'

const theme = ref<Theme>('light')

function apply(next: Theme): void {
  theme.value = next
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem(STORAGE_KEY, next)
}

/** Light/dark toggle that flips `data-theme` on <html> and persists the choice. */
export function useTheme() {
  function init(): void {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    apply(stored ?? (prefersDark ? 'dark' : 'light'))
  }

  function toggle(): void {
    apply(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, init, toggle, set: apply }
}
