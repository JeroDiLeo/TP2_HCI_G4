import { apiRequest } from '@/services/api/client'
import type { ApiRoutine } from '@/utils/routineMapper'

export type RoutinePayload = Omit<ApiRoutine, 'id'>
export type ApiRoutineResponse = ApiRoutine | { result: ApiRoutine }
export type ApiRoutineListResponse = ApiRoutine[] | { result: ApiRoutine[] | null } | null

export async function getAllRoutines(): Promise<ApiRoutineListResponse> {
  return apiRequest<ApiRoutineListResponse>('/routines', {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function getRoutine(routineId: string): Promise<ApiRoutineResponse> {
  return apiRequest<ApiRoutineResponse>(`/routines/${routineId}`, {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function addRoutine({
  name,
  actions = [],
  metadata = {},
}: RoutinePayload): Promise<ApiRoutineResponse> {
  return apiRequest<ApiRoutineResponse>('/routines', {
    method: 'POST',
    body: { name, actions, metadata },
    responseMode: 'json',
  })
}

export async function updateRoutine(
  routineId: string,
  { name, actions = [], metadata = {} }: RoutinePayload,
): Promise<ApiRoutineResponse> {
  return apiRequest<ApiRoutineResponse>(`/routines/${routineId}`, {
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

export async function executeRoutine(routineId: string): Promise<unknown> {
  return apiRequest<unknown>(`/routines/${routineId}/execute`, {
    method: 'PATCH',
    body: {},
    responseMode: 'json',
  })
}
