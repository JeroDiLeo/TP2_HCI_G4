import { apiRequest } from '@/services/api/client'
import type { ApiDevice } from '@/utils/deviceMapper'

export type { ApiDevice }

export type ApiDeviceResponse = ApiDevice | { result: ApiDevice }
export type ApiDeviceListResponse = ApiDevice[] | { result: ApiDevice[] }

export type CreateDevicePayload = {
  metadata?: Record<string, unknown>
  name: string
  room?: { id: string }
  type: { id: string }
}

export type UpdateDevicePayload = {
  metadata?: Record<string, unknown>
  name?: string
}

export async function getAllDevices(): Promise<ApiDeviceListResponse> {
  return apiRequest<ApiDeviceListResponse>('/devices', {
    method: 'GET',
    responseMode: 'textOrJson',
  })
}

export async function getDevice(deviceId: string): Promise<ApiDeviceResponse> {
  return apiRequest<ApiDeviceResponse>(`/devices/${deviceId}`, {
    method: 'GET',
    responseMode: 'textOrJson',
  })
}

export async function getDevicesByRoom(roomId: string): Promise<ApiDeviceListResponse> {
  return apiRequest<ApiDeviceListResponse>(`/rooms/${roomId}/devices`, {
    method: 'GET',
    responseMode: 'textOrJson',
  })
}

export async function addDevice({
  name,
  type,
  room,
  metadata = {},
}: CreateDevicePayload): Promise<ApiDeviceResponse> {
  const body: Record<string, unknown> = { name, type, metadata }
  if (room) body.room = room

  return apiRequest<ApiDeviceResponse>('/devices', {
    method: 'POST',
    body,
    responseMode: 'textOrJson',
  })
}

export async function updateDevice(
  deviceId: string,
  { name, metadata }: UpdateDevicePayload,
): Promise<ApiDeviceResponse> {
  const body: Record<string, unknown> = {}
  if (name !== undefined) body.name = name
  if (metadata !== undefined) body.metadata = metadata

  return apiRequest<ApiDeviceResponse>(`/devices/${deviceId}`, {
    method: 'PUT',
    body,
    responseMode: 'textOrJson',
  })
}

export async function deleteDevice(deviceId: string): Promise<void> {
  return apiRequest(`/devices/${deviceId}`, {
    method: 'DELETE',
    responseMode: 'none',
  })
}

function normalizeActionParams(params: unknown = []): unknown[] {
  if (Array.isArray(params)) return params
  if (params && typeof params === 'object') return Object.values(params)
  return []
}

function normalizeActionResult(response: unknown): unknown {
  if (response && typeof response === 'object' && 'result' in response) {
    return (response as { result: unknown }).result
  }

  return response
}

export async function getDeviceState(deviceId: string): Promise<unknown> {
  return apiRequest<unknown>(`/devices/${deviceId}/state`, {
    method: 'GET',
    responseMode: 'textOrJson',
  })
}

export async function executeAction(
  deviceId: string,
  actionName: string,
  params: unknown[] = [],
): Promise<unknown> {
  const response = await apiRequest(`/devices/${deviceId}/${actionName}`, {
    method: 'PATCH',
    body: normalizeActionParams(params),
    responseMode: 'textOrJson',
  })

  return normalizeActionResult(response)
}
