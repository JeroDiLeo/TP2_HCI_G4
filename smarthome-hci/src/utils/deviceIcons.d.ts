declare module '@/utils/deviceIcons.js' {
  export interface DeviceVisual {
    icon: string
    bg: string
    fg: string
  }

  export function getDeviceVisual(text?: string): DeviceVisual
  export function getDeviceIcon(type?: string): string
  export function getRoutineDeviceVisual(typeOrText?: string): DeviceVisual
  export function parseActionString(str: string): { device: string; detail: string }
}
