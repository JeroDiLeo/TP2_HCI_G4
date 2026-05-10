import { apiRequest } from '@/services/api/client'

type ApiResponse = any

export async function getAllDeviceTypes(): Promise<ApiResponse> {
  return apiRequest('/devicetypes', {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function getDeviceType(deviceTypeId: string): Promise<ApiResponse> {
  return apiRequest(`/devicetypes/${deviceTypeId}`, {
    method: 'GET',
    responseMode: 'json',
  })
}
