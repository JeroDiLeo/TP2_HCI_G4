import { getRoutineDeviceVisual, parseActionString, type DeviceVisual } from '@/utils/deviceIcons'
import { formatRoutineActionDetail } from '@/utils/deviceActionLabels'
import type { FrontRoutineAction } from '@/utils/routineMapper'
import type { RoomDevice } from '@/types/rooms'

export interface RoutineActionDisplayItem {
  detail: string
  device: string
  visual: DeviceVisual
}

type RoutineActionSource = FrontRoutineAction | string
type DeviceLookup = (deviceId: string) => Pick<RoomDevice, 'name' | 'type'> | undefined

export function formatRoutineActionDisplay(
  action: RoutineActionSource,
  getDeviceById: DeviceLookup,
): RoutineActionDisplayItem {
  if (typeof action === 'string') {
    const { device, detail } = parseActionString(action)

    return {
      detail,
      device,
      visual: getRoutineDeviceVisual(device),
    }
  }

  const deviceId = String(action.device?.id ?? '')
  const apiDevice = deviceId ? getDeviceById(deviceId) : undefined
  const deviceName = apiDevice?.name ?? (deviceId || 'Dispositivo')
  const deviceType = apiDevice?.type ?? 'light'

  return {
    device: deviceName,
    detail: formatRoutineActionDetail(action.actionName, action.params),
    visual: getRoutineDeviceVisual(deviceType),
  }
}

export function formatRoutineActionsDisplay(
  actions: readonly RoutineActionSource[],
  getDeviceById: DeviceLookup,
): RoutineActionDisplayItem[] {
  return actions.map(action => formatRoutineActionDisplay(action, getDeviceById))
}
