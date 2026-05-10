import type {
  RoomDevice,
  RoomDeviceType,
  RoomId,
} from '@/types/rooms'


// ── Interfaces de la API ────────────────────────────────────────────

export interface ApiDevice {
  id: string
  name: string
  type: { id: string }
  state: Record<string, unknown>
  room?: { id: string; name?: string }
  metadata?: Record<string, unknown>
}

export interface ApiDeviceTypeParam {
  name?: string
  type: string
  description?: string
  min?: number
  max?: number
  minValue?: number
  maxValue?: number
  supportedValues?: unknown[]
  example?: unknown
}

export interface ApiDeviceTypeAction {
  name: string
  description?: string
  return?: unknown
  params: ApiDeviceTypeParam[]
}

export interface ApiDeviceType {
  id: string
  name: string
  powerUsage?: number
  actions: ApiDeviceTypeAction[]
}


// ── Mapeo DeviceType ID ↔ tipo del front ────────────────────────────

const TYPE_ID_TO_FRONT: Record<string, RoomDeviceType> = {
  eu0v2xgprrhhg41g: 'light',
  go46xmbqeomjrsjr: 'ac',
  im77xxyulpegfmv8: 'alarm',
  mxztsyjzsrq7iaqc: 'blind',
  c89qmhhzm3bcpoie: 'door',
  dbrlsh0juhf3dhf0: 'faucet',
  lsf78ly0eqrjbz91: 'oven',
  rnizejqr2di0okho: 'fridge',
  fud5vmuy0fkh6zt9: 'speaker',
  ofglvd9gqx8yfl3l: 'vacuum',
}

const FRONT_TO_TYPE_ID: Record<RoomDeviceType, string> = {
  light:   'eu0v2xgprrhhg41g',
  ac:      'go46xmbqeomjrsjr',
  alarm:   'im77xxyulpegfmv8',
  blind:   'mxztsyjzsrq7iaqc',
  door:    'c89qmhhzm3bcpoie',
  faucet:  'dbrlsh0juhf3dhf0',
  oven:    'lsf78ly0eqrjbz91',
  fridge:  'rnizejqr2di0okho',
  speaker: 'fud5vmuy0fkh6zt9',
  vacuum:  'ofglvd9gqx8yfl3l',
}


// ── Tablas de traducción de valores (API ↔ Front) ───────────────────

const AC_MODE_API_TO_FRONT: Record<string, string> = {
  fan: 'ventilación', cool: 'frío', heat: 'calor',
}
const AC_MODE_FRONT_TO_API: Record<string, string> = {
  ventilación: 'fan', frío: 'cool', calor: 'heat',
}

const AC_SWING_API_TO_FRONT: Record<string, string> = {
  auto: 'automático',
}
const AC_SWING_FRONT_TO_API: Record<string, string> = {
  automático: 'auto',
}

const AC_FAN_API_TO_FRONT: Record<string, string> = {
  auto: 'automático',
}
const AC_FAN_FRONT_TO_API: Record<string, string> = {
  automático: 'auto',
}

const VACUUM_STATUS_API_TO_FRONT: Record<string, string> = {
  active: 'encendida', docked: 'apagada', inactive: 'apagada', paused: 'pausada',
}

const VACUUM_MODE_API_TO_FRONT: Record<string, string> = {
  vacuum: 'aspirar', mop: 'trapear',
}
const VACUUM_MODE_FRONT_TO_API: Record<string, string> = {
  aspirar: 'vacuum', trapear: 'mop',
}

const ALARM_STATUS_API_TO_FRONT: Record<string, string> = {
  armedStay: 'modo casa', armedAway: 'modo regular', disarmed: 'desactivada',
}
const ALARM_MODE_FRONT_TO_API: Record<string, string> = {
  'modo casa': 'armedStay', 'modo regular': 'armedAway', desactivada: 'disarmed',
}

const BLIND_STATUS_API_TO_FRONT: Record<string, string> = {
  opened: 'abierta', closed: 'cerrada', opening: 'abriéndose', closing: 'cerrándose',
}

const OVEN_HEAT_API_TO_FRONT: Record<string, string> = {
  conventional: 'convencional', bottom: 'abajo', top: 'arriba',
}
const OVEN_HEAT_FRONT_TO_API: Record<string, string> = {
  convencional: 'conventional', abajo: 'bottom', arriba: 'top',
}

const OVEN_GRILL_API_TO_FRONT: Record<string, string> = {
  off: 'apagado', eco: 'económico', large: 'completo',
}
const OVEN_GRILL_FRONT_TO_API: Record<string, string> = {
  apagado: 'off', económico: 'eco', completo: 'large',
}

const OVEN_CONVECTION_API_TO_FRONT: Record<string, string> = {
  off: 'apagado', eco: 'económico', normal: 'convencional',
}
const OVEN_CONVECTION_FRONT_TO_API: Record<string, string> = {
  apagado: 'off', económico: 'eco', convencional: 'normal',
}

const FRIDGE_MODE_API_TO_FRONT: Record<string, string> = {
  default: 'normal', party: 'fiesta', vacation: 'vacaciones',
}
const FRIDGE_MODE_FRONT_TO_API: Record<string, string> = {
  normal: 'default', fiesta: 'party', vacaciones: 'vacation',
}

const SPEAKER_GENRE_API_TO_FRONT: Record<string, string> = {
  classical: 'clásica', country: 'country', dance: 'dance',
  latina: 'latina', pop: 'pop', rock: 'rock',
}
const SPEAKER_GENRE_FRONT_TO_API: Record<string, string> = {
  clásica: 'classical',
}


// ── Helpers ─────────────────────────────────────────────────────────

/** Busca en un mapa o devuelve el valor original si no hay traducción */
function tr(map: Record<string, string>, value: unknown): string {
  const key = String(value ?? '')
  return map[key] ?? key
}

function resolveType(typeId: string): RoomDeviceType {
  return TYPE_ID_TO_FRONT[typeId] ?? 'light'
}

export function resolveTypeId(frontType: RoomDeviceType): string {
  return FRONT_TO_TYPE_ID[frontType]
}


// ── fromApi — convierte un Device de la API al shape del front ──────

export function fromApi(
  apiDevice: ApiDevice,
  roomName = '',
): RoomDevice {
  const frontType = resolveType(apiDevice.type?.id ?? '')
  const s = apiDevice.state ?? {}
  const roomId: RoomId = apiDevice.room?.id ?? ''

  const base = {
    id: apiDevice.id,
    name: apiDevice.name,
    roomId,
    roomName,
  }

  switch (frontType) {
    case 'light':
      return {
        ...base, type: 'light',
        active: s.status === 'on',
        color: s.color ? `#${s.color}` : '#FFFFFF',
        intensity: Number(s.brightness ?? 0),
      }

    case 'ac':
      return {
        ...base, type: 'ac',
        active: s.status === 'on',
        temperature: Number(s.temperature ?? 24),
        mode: tr(AC_MODE_API_TO_FRONT, s.mode) as any,
        verticalBlades: tr(AC_SWING_API_TO_FRONT, s.verticalSwing) as any,
        horizontalBlades: tr(AC_SWING_API_TO_FRONT, s.horizontalSwing) as any,
        fanSpeed: tr(AC_FAN_API_TO_FRONT, s.fanSpeed) as any,
      }

    case 'vacuum':
      return {
        ...base, type: 'vacuum',
        active: s.status !== 'docked' && s.status !== 'inactive',
        vacuumStatus: tr(VACUUM_STATUS_API_TO_FRONT, s.status) as any,
        vacuumMode: tr(VACUUM_MODE_API_TO_FRONT, s.mode) as any,
        targetRoomId: roomId,
        targetRoomName: roomName,
      }

    case 'speaker':
      return {
        ...base, type: 'speaker',
        active: s.status === 'playing' || s.status === 'paused',
        volume: Number(s.volume ?? 5),
        playing: s.status === 'playing',
        genre: tr(SPEAKER_GENRE_API_TO_FRONT, s.genre) as any,
        currentSong: String((apiDevice.metadata as any)?.currentSong ?? ''),
        timestamp: String((apiDevice.metadata as any)?.timestamp ?? '0:00'),
      }

    case 'faucet':
      return {
        ...base, type: 'faucet',
        active: s.status === 'opened',
        open: s.status === 'opened',
        quantity: Number((apiDevice.metadata as any)?.quantity ?? 100),
        unit: ((apiDevice.metadata as any)?.unit ?? 'ml') as any,
        dispensed: Number((apiDevice.metadata as any)?.dispensed ?? 0),
      }

    case 'blind':
      return {
        ...base, type: 'blind',
        active: s.status === 'opened' || s.status === 'opening' || s.status === 'closing',
        position: Number(s.level ?? 0),
        blindStatus: tr(BLIND_STATUS_API_TO_FRONT, s.status) as any,
      }

    case 'oven':
      return {
        ...base, type: 'oven',
        active: s.status === 'on',
        temperature: Number(s.temperature ?? 180),
        heatSource: tr(OVEN_HEAT_API_TO_FRONT, s.heat) as any,
        grillMode: tr(OVEN_GRILL_API_TO_FRONT, s.grill) as any,
        convectionMode: tr(OVEN_CONVECTION_API_TO_FRONT, s.convection) as any,
      }

    case 'door':
      return {
        ...base, type: 'door',
        active: true,
        open: s.status === 'opened',
        locked: s.lock === 'locked',
      }

    case 'alarm':
      return {
        ...base, type: 'alarm',
        active: s.status !== 'disarmed',
        alarmMode: tr(ALARM_STATUS_API_TO_FRONT, s.status) as any,
        code: String((apiDevice.metadata as any)?.code ?? ''),
      }

    case 'fridge':
      return {
        ...base, type: 'fridge',
        active: true,
        fridgeTemp: Number(s.temperature ?? 4),
        freezerTemp: Number(s.freezerTemperature ?? -18),
        fridgeMode: tr(FRIDGE_MODE_API_TO_FRONT, s.mode) as any,
      }

    default:
      return { ...base, type: 'light', active: false, color: '#FFFFFF', intensity: 0 }
  }
}


// ── toApiCreate — arma el body para POST /devices ───────────────────

export function toApiCreate(
  frontDevice: { name: string; type: RoomDeviceType; roomId?: RoomId },
): { name: string; type: { id: string }; room?: { id: string }; metadata: Record<string, unknown> } {
  const payload: any = {
    name: frontDevice.name,
    type: { id: FRONT_TO_TYPE_ID[frontDevice.type] },
    metadata: {},
  }

  if (frontDevice.roomId) {
    payload.room = { id: String(frontDevice.roomId) }
  }

  return payload
}


// ── Tablas exportadas para uso en el store / componentes ────────────

export {
  TYPE_ID_TO_FRONT,
  FRONT_TO_TYPE_ID,
  AC_MODE_FRONT_TO_API,
  AC_SWING_FRONT_TO_API,
  AC_FAN_FRONT_TO_API,
  VACUUM_MODE_FRONT_TO_API,
  ALARM_MODE_FRONT_TO_API,
  OVEN_HEAT_FRONT_TO_API,
  OVEN_GRILL_FRONT_TO_API,
  OVEN_CONVECTION_FRONT_TO_API,
  FRIDGE_MODE_FRONT_TO_API,
  SPEAKER_GENRE_FRONT_TO_API,
}
