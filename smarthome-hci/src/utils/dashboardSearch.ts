import type { Room } from '@/stores/rooms'
import type { FrontRoutine } from '@/utils/routineMapper'
import type { RoomDevice, RoomDeviceType } from '@/types/rooms'
import { getActionLabel } from '@/utils/deviceActionLabels'

export type DashboardSearchItemKind = 'device' | 'room' | 'routine'

export interface DashboardSearchItem {
  kind: DashboardSearchItemKind
  id: string
  title: string
  icon: string
  eyebrow: string
  meta: string
  detail: string
  favorite?: boolean
  actionLabel?: string
  actionLoading?: boolean
  targetRoomId?: string
}

export interface DashboardSearchSection {
  id: DashboardSearchItemKind
  title: string
  icon: string
  items: DashboardSearchItem[]
}

const DEVICE_TYPE_LABELS: Record<RoomDeviceType, string> = {
  light: 'Lámpara',
  ac: 'Aire acondicionado',
  vacuum: 'Aspiradora',
  speaker: 'Parlante',
  faucet: 'Grifo',
  blind: 'Persiana',
  oven: 'Horno',
  door: 'Puerta',
  alarm: 'Alarma',
  fridge: 'Heladera',
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  living: 'Sala',
  bedroom: 'Dormitorio',
  kitchen: 'Cocina',
  bathroom: 'Baño',
  office: 'Oficina',
  other: 'Otro',
}

const DAY_LABELS: Record<string, string> = {
  lun: 'Lun',
  mar: 'Mar',
  mie: 'Mié',
  jue: 'Jue',
  vie: 'Vie',
  sab: 'Sab',
  dom: 'Dom',
}

export function normalizeSearchText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesQuery(query: string, fields: unknown[]): boolean {
  const q = normalizeSearchText(query)
  if (!q) return true
  return fields.some(field => normalizeSearchText(field).includes(q))
}

export function getDeviceTypeLabel(type: RoomDeviceType): string {
  return DEVICE_TYPE_LABELS[type] ?? type
}

export function getRoomTypeLabel(type?: string): string {
  return ROOM_TYPE_LABELS[type ?? 'other'] ?? ROOM_TYPE_LABELS.other
}

export function formatDeviceState(device: RoomDevice): string {
  switch (device.type) {
    case 'light':
      return device.active ? `Encendida · ${device.intensity}%` : 'Apagada'
    case 'ac':
      return device.active ? `${device.temperature}°C · ${toSentenceCase(device.mode)}` : 'Apagado'
    case 'vacuum':
      return `${toSentenceCase(device.vacuumStatus)} · ${toSentenceCase(device.vacuumMode)}`
    case 'speaker':
      if (!device.active) return 'Apagado'
      return `${device.playing ? 'Reproduciendo' : 'Pausado'} · Vol. ${device.volume}`
    case 'faucet':
      return device.open ? `Abierto · ${device.quantity}${device.unit}` : 'Cerrado'
    case 'blind':
      return `${device.position}% · ${toSentenceCase(device.blindStatus)}`
    case 'oven':
      return device.active ? `${device.temperature}°C · ${toSentenceCase(device.heatSource)}` : 'Apagado'
    case 'door':
      return `${device.open ? 'Abierta' : 'Cerrada'} · ${device.locked ? 'Bloqueada' : 'Desbloqueada'}`
    case 'alarm':
      return toSentenceCase(device.alarmMode)
    case 'fridge':
      return `${device.fridgeTemp}°C · ${toSentenceCase(device.fridgeMode)}`
  }

  return (device as { active?: boolean }).active ? 'Activo' : 'Inactivo'
}

export function getRoomActivityLabel(room: Room): string {
  const total = room.devicesTotal ?? 0
  const active = room.devicesActive ?? 0
  if (total === 0) return 'Sin dispositivos'
  return `${active} de ${total} ${pluralize(total, 'dispositivo', 'dispositivos')} activos`
}

export function formatRoutineTrigger(routine: FrontRoutine): string {
  if (routine.trigger.type !== 'schedule' || !routine.trigger.time) {
    return 'Activación manual'
  }

  const days = routine.days
    .map(day => DAY_LABELS[day] ?? day)
    .join(', ')

  return days ? `${routine.trigger.time} · ${days}` : `${routine.trigger.time} · Sin días`
}

export function formatRoutineActionCount(routine: FrontRoutine): string {
  const count = routine.actions.length
  return `${count} ${pluralize(count, 'acción', 'acciones')}`
}

export function deviceSearchFields(device: RoomDevice): unknown[] {
  return [
    device.name,
    device.roomName,
    device.type,
    getDeviceTypeLabel(device.type),
    formatDeviceState(device),
    device.active ? 'activo encendido prendido' : 'inactivo apagado',
  ]
}

export function roomSearchFields(room: Room): unknown[] {
  return [
    room.name,
    room.type,
    getRoomTypeLabel(room.type),
    getRoomActivityLabel(room),
    room.favorite ? 'favorita' : '',
  ]
}

export function routineSearchFields(
  routine: FrontRoutine,
  deviceNameForAction: (deviceId: string) => string,
): unknown[] {
  const actionFields = routine.actions.flatMap(action => [
    getActionLabel(action.actionName),
    action.actionName,
    deviceNameForAction(action.device.id),
  ])

  return [
    routine.name,
    routine.description,
    routine.category,
    formatRoutineTrigger(routine),
    routine.favorite ? 'favorita' : '',
    ...actionFields,
  ]
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

function toSentenceCase(value: string): string {
  if (!value) return ''
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}
