import { apiRequest } from '@/services/api/client'
import type { ApiDeviceType } from '@/utils/deviceMapper'

export type ApiDeviceTypeResponse = ApiDeviceType | { result: ApiDeviceType }
export type ApiDeviceTypeListResponse = ApiDeviceType[] | { result: ApiDeviceType[] }

export async function getAllDeviceTypes(): Promise<ApiDeviceTypeListResponse> {
  return apiRequest<ApiDeviceTypeListResponse>('/devicetypes', {
    method: 'GET',
    responseMode: 'json',
  })
}

export async function getDeviceType(deviceTypeId: string): Promise<ApiDeviceTypeResponse> {
  return apiRequest<ApiDeviceTypeResponse>(`/devicetypes/${deviceTypeId}`, {
    method: 'GET',
    responseMode: 'json',
  })
}
