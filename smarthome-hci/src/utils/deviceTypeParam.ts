import type { ApiDeviceTypeParam } from '@/utils/deviceMapper'

export function getParamMin(param: ApiDeviceTypeParam): number | undefined {
  return param.minValue ?? param.min
}

export function getParamMax(param: ApiDeviceTypeParam): number | undefined {
  return param.maxValue ?? param.max
}

export function normalizeHexColor(value: string): string {
  if (!value) return '#FFFFFF'
  const normalized = value.startsWith('#') ? value : `#${value}`
  return normalized.toUpperCase()
}

export function isColorParam(param: ApiDeviceTypeParam, actionName?: string): boolean {
  return String(param.name ?? '').toLowerCase().includes('color') || actionName === 'setColor'
}

export function isRoomIdParam(param: ApiDeviceTypeParam): boolean {
  return String(param.name ?? '').toLowerCase().includes('roomid')
}

export function isSecurityCodeParam(param: ApiDeviceTypeParam): boolean {
  return String(param.name ?? '').toLowerCase().includes('securitycode')
}

export function hasSupportedValues(param: ApiDeviceTypeParam): boolean {
  return Array.isArray(param.supportedValues) && param.supportedValues.length > 0
}

export function hasRange(param: ApiDeviceTypeParam): boolean {
  return getParamMin(param) !== undefined || getParamMax(param) !== undefined
}
