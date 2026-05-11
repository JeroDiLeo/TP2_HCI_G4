import { apiRequest } from '@/services/api/client'

export type ApiSharedUser = {
  email: string
  id: string
  name: string
  sharedAt: string
} & Record<string, unknown>

export type ApiHome = {
  id: string
  metadata: Record<string, unknown>
  name: string
  sharedWith?: ApiSharedUser[]
} & Record<string, unknown>

export type ApiHomePayload = {
  name: string
  metadata?: Record<string, unknown>
}

export type ApiHomeResponse = ApiHome | { result: ApiHome }
export type ApiHomeListResponse = ApiHome[] | { result: ApiHome[] }
export type ShareHomeResponse = ApiSharedUser | ApiSharedUser[]

export type ShareInfo = {
  owner: unknown | null
  sharedBy: unknown | null
  users: ApiSharedUser[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export async function getAllHomes(): Promise<ApiHomeListResponse> {
  return apiRequest<ApiHomeListResponse>('/homes', {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function getHome(homeId: string): Promise<ApiHomeResponse> {
  return apiRequest<ApiHomeResponse>(`/homes/${homeId}`, {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function addHome({ name, metadata = {} }: ApiHomePayload): Promise<ApiHomeResponse> {
  return apiRequest<ApiHomeResponse>('/homes', {
    method: 'POST',
    body: { name, metadata },
    responseMode: 'json',
  })
}

export async function updateHome(
  homeId: string,
  { name, metadata = {} }: ApiHomePayload,
): Promise<ApiHomeResponse> {
  return apiRequest<ApiHomeResponse>(`/homes/${homeId}`, {
    method: 'PUT',
    body: { name, metadata },
    responseMode: 'json',
  })
}

export async function deleteHome(homeId: string): Promise<void> {
  return apiRequest(`/homes/${homeId}`, {
    method: 'DELETE',
    responseMode: 'none',
  })
}

export async function getSharedUsers(homeId: string): Promise<ApiSharedUser[]> {
  const { users } = await getHomeShareInfo(homeId)

  return users
}

export async function getHomeShareInfo(homeId: string): Promise<ShareInfo> {
  const data = await apiRequest<unknown>(`/homes/${homeId}/share`, {
    method: 'GET',
    responseMode: 'json',
  })

  return normalizeShareInfo(data)
}

function normalizeShareInfo(data: unknown): ShareInfo {
  if (Array.isArray(data)) {
    return { users: data as ApiSharedUser[], owner: null, sharedBy: null }
  }

  if (!isRecord(data)) {
    return { users: [], owner: null, sharedBy: null }
  }

  const users =
    data.users ??
    data.sharedUsers ??
    data.sharedWith ??
    data.members ??
    data.data ??
    []

  return {
    users: Array.isArray(users) ? users as ApiSharedUser[] : [],
    owner:
      data.owner ??
      data.createdBy ??
      data.creator ??
      (data.ownerName || data.ownerEmail ? { name: data.ownerName, email: data.ownerEmail } : null),
    sharedBy:
      data.sharedBy ??
      data.sharedByUser ??
      (data.sharedByName || data.sharedByEmail ? { name: data.sharedByName, email: data.sharedByEmail } : null),
  }
}

export async function shareHome(homeId: string, emails: string | string[]): Promise<ShareHomeResponse> {
  const emailList = Array.isArray(emails) ? emails : [emails]

  return apiRequest<ShareHomeResponse>(`/homes/${homeId}/share`, {
    method: 'POST',
    body: { emails: emailList },
    responseMode: 'json',
  })
}
