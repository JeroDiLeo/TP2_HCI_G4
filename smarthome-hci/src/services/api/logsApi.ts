import { apiRequest } from '@/services/api/client'
import type { RawApiLog } from '@/types/logs'

type ApiLogListResponse = RawApiLog[] | { result?: RawApiLog[] | null } | string | null

function safeInt(value: unknown, fallback = 0): number {
  const n = Math.trunc(Number(value))

  return Number.isFinite(n) && n >= 0 ? n : fallback
}

function normalizeLogList(data: ApiLogListResponse): RawApiLog[] {
  if (Array.isArray(data)) return data

  const result = data && typeof data === 'object'
    ? data.result
    : undefined

  return Array.isArray(result) ? result : []
}

export async function getAllLogs(limit: unknown, offset: unknown): Promise<RawApiLog[]> {
  const l = safeInt(limit, 20)
  const o = safeInt(offset, 0)
  const data = await apiRequest<ApiLogListResponse>(`/devices/logs/limit/${l}/offset/${o}`, {
    method: 'GET',
    responseMode: 'textOrJson',
  })

  return normalizeLogList(data)
}

export async function getDeviceLogs(
  deviceId: string,
  limit: unknown,
  offset: unknown,
): Promise<RawApiLog[]> {
  const l = safeInt(limit, 20)
  const o = safeInt(offset, 0)
  const encodedDeviceId = encodeURIComponent(String(deviceId))
  const data = await apiRequest<ApiLogListResponse>(`/devices/${encodedDeviceId}/logs/limit/${l}/offset/${o}`, {
    method: 'GET',
    responseMode: 'textOrJson',
  })

  return normalizeLogList(data)
}
