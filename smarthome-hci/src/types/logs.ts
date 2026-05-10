import type { RoomDeviceType } from '@/types/rooms'

// NOTE: Shape assumed from API patterns — confirm with testing.
// Expected: GET /devices/logs/... → { result: RawApiLog[] }
export type RawApiLog = {
  id?: string
  deviceId?: string   // fallback if API returns deviceId flat instead of device.id
  device?: {
    id?: string
    name?: string
    type?: {
      id?: string
      name?: string
    }
  }
  actionName?: string
  params?: unknown[] | Record<string, unknown> | null
  timestamp?: string
  result?: unknown
}

export type LogEntry = {
  id: string              // raw.id ?? `${deviceId}:${timestamp}:${actionName}:${index}`
  deviceId: string
  deviceName: string
  deviceType: RoomDeviceType | 'unknown'
  deviceTypeApiId: string
  roomName?: string
  actionName: string
  params: unknown[]
  timestamp: string       // ISO 8601
  result?: unknown
}
