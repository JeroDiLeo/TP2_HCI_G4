export interface DeviceCatalogItem {
  type: string
  label: string
  icon: string
}

export const DEVICE_CATALOG = [
  { type: 'vacuum', label: 'Aspiradora', icon: 'mdi-robot-vacuum' },
  { type: 'speaker', label: 'Parlante', icon: 'mdi-speaker' },
  { type: 'faucet', label: 'Grifo', icon: 'mdi-water-pump' },
  { type: 'blind', label: 'Persiana', icon: 'mdi-blinds' },
  { type: 'light', label: 'Lámpara', icon: 'mdi-lightbulb-outline' },
  { type: 'oven', label: 'Horno', icon: 'mdi-stove' },
  { type: 'ac', label: 'Aire acond.', icon: 'mdi-air-conditioner' },
  { type: 'door', label: 'Puerta', icon: 'mdi-door' },
  { type: 'alarm', label: 'Alarma', icon: 'mdi-alarm-light-outline' },
  { type: 'fridge', label: 'Heladera', icon: 'mdi-fridge-outline' },
] as const satisfies readonly DeviceCatalogItem[]

export const DEFAULT_DEVICE_ICON = 'mdi-power-plug-outline'

export const DEVICE_TYPE_ICONS: Record<string, string> = {
  light: 'mdi-lightbulb-outline',
  ac: 'mdi-air-conditioner',
  vacuum: 'mdi-robot-vacuum',
  speaker: 'mdi-speaker',
  faucet: 'mdi-water-pump',
  blind: 'mdi-blinds',
  oven: 'mdi-toaster-oven',
  door: 'mdi-door-closed',
  alarm: 'mdi-alarm-light-outline',
  fridge: 'mdi-fridge-outline',
}

export const DEVICE_TYPE_LABELS = Object.fromEntries(
  DEVICE_CATALOG.map(device => [device.type, device.label]),
) as Record<string, string>

export function getDeviceTypeLabel(type: string): string {
  return DEVICE_TYPE_LABELS[type] ?? type
}

export function getDeviceTypeIcon(type: string, fallback = DEFAULT_DEVICE_ICON): string {
  return DEVICE_TYPE_ICONS[type] ?? fallback
}

export function getDeviceCatalogIcon(type: string, fallback = 'mdi-help-circle-outline'): string {
  return DEVICE_CATALOG.find(device => device.type === type)?.icon ?? fallback
}
