// Types for the Room Detail view.
// Independent of the generic Device in dashboard.ts — each device type
// carries only the fields it actually needs.

export type RoomId = number | string

export type RoomDeviceType =
  | 'light'
  | 'ac'
  | 'vacuum'
  | 'speaker'
  | 'faucet'
  | 'blind'
  | 'oven'
  | 'door'
  | 'alarm'
  | 'fridge'

// Closed unions for AC aspas / fan -----------------------------------
export type VerticalBladesValue   = 'automático' | '22' | '45' | '67' | '90'
export type HorizontalBladesValue = 'automático' | '-90' | '-45' | '0' | '45' | '90'
export type FanSpeedValue         = 'automático' | '25' | '50' | '75' | '100'

// Closed union for speaker genre ------------------------------------
export type MusicGenre =
  | 'clásica' | 'country' | 'dance' | 'latina' | 'pop' | 'rock'

// Base ---------------------------------------------------------------
// `active` is the device-level power/connected flag; specific state
// fields (vacuumStatus, alarmMode, open) are the fine-grained truth.
// The two MUST be kept consistent:
//   vacuum  → active ↔ vacuumStatus !== 'apagada'
//   alarm   → active ↔ alarmMode   !== 'desactivada'
//   faucet  → `active` tracks device power; `open` tracks valve state
interface RoomDeviceBase {
  id: number | string
  name: string
  type: RoomDeviceType
  active: boolean
  roomId: RoomId
  roomName: string
  metadata?: Record<string, unknown>
}

// ── Light ────────────────────────────────────────────────────────────
export interface LightDevice extends RoomDeviceBase {
  type: 'light'
  color: string      // hex e.g. '#FCD34D'
  intensity: number  // 0–100
}

// ── AC ───────────────────────────────────────────────────────────────
export interface AcDevice extends RoomDeviceBase {
  type: 'ac'
  temperature: number  // 18–38
  mode: 'ventilación' | 'frío' | 'calor'
  verticalBlades: VerticalBladesValue
  horizontalBlades: HorizontalBladesValue
  fanSpeed: FanSpeedValue
}

// ── Vacuum ───────────────────────────────────────────────────────────
// active MUST match vacuumStatus !== 'apagada'
export interface VacuumDevice extends RoomDeviceBase {
  type: 'vacuum'
  vacuumStatus: 'apagada' | 'encendida' | 'pausada'
  vacuumMode: 'aspirar' | 'trapear'
  targetRoomId: RoomId
  targetRoomName: string
}

// ── Speaker ──────────────────────────────────────────────────────────
export interface SpeakerDevice extends RoomDeviceBase {
  type: 'speaker'
  volume: number     // 0–10
  playing: boolean
  genre: MusicGenre
  currentSong: string
  timestamp: string
}

// ── Faucet ───────────────────────────────────────────────────────────
// `active` = device is connected/powered; `open` = valve is open
export interface FaucetDevice extends RoomDeviceBase {
  type: 'faucet'
  open: boolean
  quantity: number   // 0–100
  unit: 'ml' | 'cl' | 'dl' | 'l'
  dispensed: number
}

// ── Blind ────────────────────────────────────────────────────────────
export interface BlindDevice extends RoomDeviceBase {
  type: 'blind'
  position: number   // 0–100
  blindStatus: 'cerrada' | 'cerrándose' | 'abriéndose' | 'abierta'
}

// ── Oven ─────────────────────────────────────────────────────────────
export interface OvenDevice extends RoomDeviceBase {
  type: 'oven'
  temperature: number  // 90–230
  heatSource: 'convencional' | 'abajo' | 'arriba'
  grillMode: 'apagado' | 'económico' | 'completo'
  convectionMode: 'apagado' | 'económico' | 'convencional'
}

// ── Door ─────────────────────────────────────────────────────────────
// active is semantically always true for a connected door
export interface DoorDevice extends RoomDeviceBase {
  type: 'door'
  open: boolean
  locked: boolean
}

// ── Alarm ────────────────────────────────────────────────────────────
// active MUST match alarmMode !== 'desactivada'
// code is local mock state only — never sent to a backend
export interface AlarmDevice extends RoomDeviceBase {
  type: 'alarm'
  alarmMode: 'desactivada' | 'modo casa' | 'modo regular'
  code: string
}

// ── Fridge ───────────────────────────────────────────────────────────
// active is semantically always true for a connected fridge
export interface FridgeDevice extends RoomDeviceBase {
  type: 'fridge'
  fridgeTemp: number   // 2–8
  freezerTemp: number  // −20 to −8
  fridgeMode: 'normal' | 'fiesta' | 'vacaciones'
}

// ── Union ────────────────────────────────────────────────────────────
export type RoomDevice =
  | LightDevice
  | AcDevice
  | VacuumDevice
  | SpeakerDevice
  | FaucetDevice
  | BlindDevice
  | OvenDevice
  | DoorDevice
  | AlarmDevice
  | FridgeDevice
