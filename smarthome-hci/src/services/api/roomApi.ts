import { apiRequest } from '@/services/api/client'

type ApiBody = Record<string, unknown>
type ApiResponse = any

export async function createRoom(body: ApiBody): Promise<ApiResponse> {
  return apiRequest('/rooms', {
    method: 'POST',
    body,
    responseMode: 'json',
  })
}

export async function updateRoom(roomId: string, body: ApiBody): Promise<ApiResponse> {
  return apiRequest(`/rooms/${roomId}`, {
    method: 'PUT',
    body,
  })
}

export async function deleteRoom(roomId: string): Promise<ApiResponse> {
  return apiRequest(`/rooms/${roomId}`, { method: 'DELETE' })
}

export async function getRoomsByHome(homeId: string): Promise<ApiResponse> {
  return apiRequest(`/homes/${homeId}/rooms`, {
    method: 'GET',
    responseMode: 'json',
  })
}
