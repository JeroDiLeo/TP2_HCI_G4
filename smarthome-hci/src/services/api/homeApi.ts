import { apiRequest } from '@/services/api/client'

type ApiResponse = any
type HomePayload = {
  name: string
  metadata?: Record<string, unknown>
}

type ShareInfo = {
  owner: unknown | null
  sharedBy: unknown | null
  users: any[]
}

export async function getAllHomes(): Promise<ApiResponse> {
  return apiRequest('/homes', {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function getHome(homeId: string): Promise<ApiResponse> {
  return apiRequest(`/homes/${homeId}`, {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function addHome({ name, metadata = {} }: HomePayload): Promise<ApiResponse> {
  return apiRequest('/homes', {
    method: 'POST',
    body: { name, metadata },
    responseMode: 'json',
  })
}

export async function updateHome(
  homeId: string,
  { name, metadata = {} }: HomePayload,
): Promise<ApiResponse> {
  return apiRequest(`/homes/${homeId}`, {
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

export async function getSharedUsers(homeId: string): Promise<any[]> {
  const { users } = await getHomeShareInfo(homeId)

  return users
}

export async function getHomeShareInfo(homeId: string): Promise<ShareInfo> {
  const data = await apiRequest(`/homes/${homeId}/share`, {
    method: 'GET',
    responseMode: 'json',
  })

  return normalizeShareInfo(data)
}

function normalizeShareInfo(data: any): ShareInfo {
  if (Array.isArray(data)) {
    return { users: data, owner: null, sharedBy: null }
  }

  const users =
    data?.users ??
    data?.sharedUsers ??
    data?.sharedWith ??
    data?.members ??
    data?.data ??
    []

  return {
    users: Array.isArray(users) ? users : [],
    owner:
      data?.owner ??
      data?.createdBy ??
      data?.creator ??
      (data?.ownerName || data?.ownerEmail ? { name: data.ownerName, email: data.ownerEmail } : null),
    sharedBy:
      data?.sharedBy ??
      data?.sharedByUser ??
      (data?.sharedByName || data?.sharedByEmail ? { name: data.sharedByName, email: data.sharedByEmail } : null),
  }
}

export async function shareHome(homeId: string, emails: string | string[]): Promise<ApiResponse> {
  const emailList = Array.isArray(emails) ? emails : [emails]

  return apiRequest(`/homes/${homeId}/share`, {
    method: 'POST',
    body: { emails: emailList },
    responseMode: 'json',
  })
}
