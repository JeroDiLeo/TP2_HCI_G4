import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllLogs, getDeviceLogs } from '@/services/api/logsApi'
import { useDevicesStore } from '@/stores/devices'
import { useRoomsStore } from '@/stores/rooms'
import { useHomesStore } from '@/stores/homes'
import type { RawApiLog, LogEntry } from '@/types/logs'
import type { RoomDevice, RoomDeviceType } from '@/types/rooms'

const FETCH_LIMIT = 20
const MAX_FETCH_ROUNDS = 5

const VALID_TYPES = new Set<RoomDeviceType>([
  'light', 'ac', 'vacuum', 'speaker', 'faucet', 'blind', 'oven', 'door', 'alarm', 'fridge',
])

function normalizeParams(raw: RawApiLog['params']): unknown[] {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw
  return Object.values(raw as Record<string, unknown>)
}

function mapToLogEntry(raw: RawApiLog, rawIndex: number, device?: RoomDevice): LogEntry {
  const deviceId = raw.device?.id ?? raw.deviceId ?? ''
  const timestamp = raw.timestamp ?? ''
  const actionName = raw.actionName ?? ''
  const rawType = device?.type
  const deviceType: LogEntry['deviceType'] =
    rawType && VALID_TYPES.has(rawType) ? rawType : 'unknown'
  return {
    id: raw.id ?? `${deviceId}:${timestamp}:${actionName}:${rawIndex}`,
    deviceId,
    deviceName: device?.name ?? raw.device?.name ?? 'Dispositivo desconocido',
    deviceType,
    deviceTypeApiId: raw.device?.type?.id ?? '',
    roomName: device?.roomName,
    actionName,
    params: normalizeParams(raw.params),
    timestamp,
    result: raw.result,
  }
}

export const useLogsStore = defineStore('logs', () => {
  const allRawLogs = ref<RawApiLog[]>([])
  const backendOffset = ref(0)
  const hasMore = ref(true)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedDeviceId = ref<string | null>(null)
  const currentPage = ref(1)

  const filteredLogs = computed<LogEntry[]>(() => {
    const devicesStore = useDevicesStore()
    const roomsStore = useRoomsStore()
    const homesStore = useHomesStore()
    if (devicesStore.loading || roomsStore.loading) return []
    if (!homesStore.selectedHomeId) return []
    const activeRoomIds = new Set(roomsStore.rooms.map((r: { id: string | number }) => String(r.id)))
    if (activeRoomIds.size === 0) return []
    const homeDeviceMap = new Map<string, RoomDevice>()
    for (const d of devicesStore.devices) {
      if (activeRoomIds.has(String(d.roomId))) {
        homeDeviceMap.set(String(d.id), d)
      }
    }
    const entries: LogEntry[] = []
    allRawLogs.value.forEach((raw, rawIndex) => {
      const rawDeviceId = String(raw.device?.id ?? raw.deviceId ?? '')
      if (!homeDeviceMap.has(rawDeviceId)) return
      if (selectedDeviceId.value && rawDeviceId !== String(selectedDeviceId.value)) return
      entries.push(mapToLogEntry(raw, rawIndex, homeDeviceMap.get(rawDeviceId)))
    })
    return entries
  })

  async function fetchUntilFull(neededCount: number): Promise<void> {
    const devicesStore = useDevicesStore()
    const roomsStore = useRoomsStore()
    if (devicesStore.loading || roomsStore.loading) return
    if (roomsStore.rooms.length === 0) return
    if (!hasMore.value || loading.value) return
    loading.value = true
    error.value = null
    const deviceId = selectedDeviceId.value
    let rounds = 0
    try {
      while (
        filteredLogs.value.length < neededCount &&
        hasMore.value &&
        rounds < MAX_FETCH_ROUNDS
      ) {
        rounds++
        const rawBatch = deviceId
          ? await getDeviceLogs(deviceId, FETCH_LIMIT, backendOffset.value)
          : await getAllLogs(FETCH_LIMIT, backendOffset.value)
        const batch = Array.isArray(rawBatch) ? rawBatch : []
        allRawLogs.value.push(...(batch as RawApiLog[]))
        backendOffset.value += batch.length
        if (batch.length < FETCH_LIMIT) {
          hasMore.value = false
        }
      }
    } catch (fetchError: unknown) {
      const message = fetchError instanceof Error
        ? fetchError.message
        : String(fetchError)
      error.value = message || 'Error al cargar el historial'
    }
    loading.value = false
  }

  function reset(): void {
    allRawLogs.value = []
    backendOffset.value = 0
    hasMore.value = true
    loading.value = false
    error.value = null
    currentPage.value = 1
  }

  function setDeviceFilter(deviceId: string | null): void {
    selectedDeviceId.value = deviceId
    allRawLogs.value = []
    backendOffset.value = 0
    hasMore.value = true
    error.value = null
    currentPage.value = 1
  }

  return {
    loading,
    error,
    hasMore,
    currentPage,
    selectedDeviceId,
    filteredLogs,
    fetchUntilFull,
    reset,
    setDeviceFilter,
  }
})
