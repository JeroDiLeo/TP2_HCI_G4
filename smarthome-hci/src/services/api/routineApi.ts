import { apiRequest } from '@/services/api/client'

type ApiResponse = any
type RoutinePayload = {
  actions?: unknown[]
  metadata?: Record<string, unknown>
  name: string
}

export async function getAllRoutines(): Promise<ApiResponse> {
  return apiRequest('/routines', {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function getRoutine(routineId: string): Promise<ApiResponse> {
  return apiRequest(`/routines/${routineId}`, {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function addRoutine({
  name,
  actions = [],
  metadata = {},
}: RoutinePayload): Promise<ApiResponse> {
  return apiRequest('/routines', {
    method: 'POST',
    body: { name, actions, metadata },
    responseMode: 'json',
  })
}

export async function updateRoutine(
  routineId: string,
  { name, actions = [], metadata = {} }: RoutinePayload,
): Promise<ApiResponse> {
  return apiRequest(`/routines/${routineId}`, {
    method: 'PUT',
    body: { name, actions, metadata },
    responseMode: 'json',
  })
}

export async function deleteRoutine(routineId: string): Promise<void> {
  return apiRequest(`/routines/${routineId}`, {
    method: 'DELETE',
    responseMode: 'none',
  })
}

export async function executeRoutine(routineId: string): Promise<ApiResponse> {
  return apiRequest(`/routines/${routineId}/execute`, {
    method: 'PATCH',
    body: {},
    responseMode: 'json',
  })
}
