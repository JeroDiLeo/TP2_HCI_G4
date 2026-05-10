import { apiRequest } from '@/services/api/client'

export interface ApiRoom {
  id: string | number
  name?: string
  home?: { id?: string | number }
  metadata?: Record<string, unknown>
}

export type ApiRoomPayload = {
  home?: { id: string }
  metadata?: Record<string, unknown>
  name?: string
}

export type ApiRoomResponse = ApiRoom | { result: ApiRoom }
export type ApiOptionalRoomResponse = ApiRoom | { result: ApiRoom | null } | null
export type ApiRoomListResponse = ApiRoom[] | { result: ApiRoom[] | null } | null

export async function createRoom(body: ApiRoomPayload & { name: string }): Promise<ApiRoomResponse> {
  return apiRequest<ApiRoomResponse>('/rooms', {
    method: 'POST',
    body,
    responseMode: 'json',
  })
}

export async function updateRoom(roomId: string, body: ApiRoomPayload): Promise<ApiOptionalRoomResponse> {
  return apiRequest<ApiOptionalRoomResponse>(`/rooms/${roomId}`, {
    method: 'PUT',
    body,
  })
}

export async function deleteRoom(roomId: string): Promise<unknown> {
  return apiRequest<unknown>(`/rooms/${roomId}`, { method: 'DELETE' })
}

export async function getRoomsByHome(homeId: string): Promise<ApiRoomListResponse> {
  return apiRequest<ApiRoomListResponse>(`/homes/${homeId}/rooms`, {
    method: 'GET',
    responseMode: 'json',
  })
}
