import { apiRequest } from '@/services/api/client'

function safeInt(value: unknown, fallback = 0): number {
  const n = Math.trunc(Number(value))

  return Number.isFinite(n) && n >= 0 ? n : fallback
}

function normalizeLogList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data

  const result = data && typeof data === 'object'
    ? (data as { result?: unknown }).result
    : undefined

  return Array.isArray(result) ? result : []
}

export async function getAllLogs(limit: unknown, offset: unknown): Promise<unknown[]> {
  const l = safeInt(limit, 20)
  const o = safeInt(offset, 0)
  const data = await apiRequest(`/devices/logs/limit/${l}/offset/${o}`, {
    method: 'GET',
    responseMode: 'textOrJson',
  })

  return normalizeLogList(data)
}

export async function getDeviceLogs(
  deviceId: string,
  limit: unknown,
  offset: unknown,
): Promise<unknown[]> {
  const l = safeInt(limit, 20)
  const o = safeInt(offset, 0)
  const encodedDeviceId = encodeURIComponent(String(deviceId))
  const data = await apiRequest(`/devices/${encodedDeviceId}/logs/limit/${l}/offset/${o}`, {
    method: 'GET',
    responseMode: 'textOrJson',
  })

  return normalizeLogList(data)
}
