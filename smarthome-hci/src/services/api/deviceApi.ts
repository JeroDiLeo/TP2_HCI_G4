import { apiRequest } from '@/services/api/client'

type ApiResponse = any

type CreateDevicePayload = {
  metadata?: Record<string, unknown>
  name: string
  room?: unknown
  type: unknown
}

type UpdateDevicePayload = {
  metadata?: Record<string, unknown>
  name?: string
}

export async function getAllDevices(): Promise<ApiResponse> {
  return apiRequest('/devices', {
    method: 'GET',
    responseMode: 'textOrJson',
  })
}

export async function getDevice(deviceId: string): Promise<ApiResponse> {
  return apiRequest(`/devices/${deviceId}`, {
    method: 'GET',
    responseMode: 'textOrJson',
  })
}

export async function getDevicesByRoom(roomId: string): Promise<ApiResponse> {
  return apiRequest(`/rooms/${roomId}/devices`, {
    method: 'GET',
    responseMode: 'textOrJson',
  })
}

export async function addDevice({
  name,
  type,
  room,
  metadata = {},
}: CreateDevicePayload): Promise<ApiResponse> {
  const body: Record<string, unknown> = { name, type, metadata }
  if (room) body.room = room

  return apiRequest('/devices', {
    method: 'POST',
    body,
    responseMode: 'textOrJson',
  })
}

export async function updateDevice(
  deviceId: string,
  { name, metadata }: UpdateDevicePayload,
): Promise<ApiResponse> {
  const body: Record<string, unknown> = {}
  if (name !== undefined) body.name = name
  if (metadata !== undefined) body.metadata = metadata

  return apiRequest(`/devices/${deviceId}`, {
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

export async function getDeviceState(deviceId: string): Promise<ApiResponse> {
  return apiRequest(`/devices/${deviceId}/state`, {
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
