import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'smart-home:user-preferences'

type ViewMode = 'scroll' | 'pagination'

function loadFromStorage(): { viewMode: ViewMode; pageSize: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { viewMode: 'pagination', pageSize: 3 }
    const parsed = JSON.parse(raw)
    return {
      viewMode: parsed.viewMode === 'scroll' ? 'scroll' : 'pagination',
      pageSize: [2, 3, 4, 5, 6].includes(parsed.pageSize) ? parsed.pageSize : 3,
    }
  } catch {
    return { viewMode: 'pagination', pageSize: 3 }
  }
}

export const usePreferencesStore = defineStore('preferences', () => {
  const saved = loadFromStorage()

  const viewMode = ref<ViewMode>(saved.viewMode)
  const pageSize = ref<number>(saved.pageSize)

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  function setPageSize(size: number) {
    pageSize.value = size
  }

  watch(
    [viewMode, pageSize],
    ([mode, size]) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ viewMode: mode, pageSize: size }))
    },
  )

  return { viewMode, pageSize, setViewMode, setPageSize }
})
