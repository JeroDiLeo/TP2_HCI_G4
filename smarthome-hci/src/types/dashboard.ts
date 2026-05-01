export type DeviceType =
  | 'light'     // Lámpara
  | 'ac'        // Aire acondicionado
  | 'appliance' // Generic legacy
  | 'vacuum'    // Aspiradora
  | 'speaker'   // Parlante
  | 'faucet'    // Grifo / Aspersor
  | 'blind'     // Persiana / Cortina / Toldo
  | 'oven'      // Horno
  | 'door'      // Puerta
  | 'alarm'     // Alarma
  | 'fridge'    // Heladera

export interface Device {
  id: number
  name: string
  type: DeviceType
  value: number
  unit: string
  hasSlider: boolean
  active: boolean
  min?: number
  max?: number
  step?: number
}

export interface Room {
  id: number
  name: string
  icon: string
  category: string
  devices: Device[]
}

export interface Routine {
  id: number
  name: string
  time: string
  icon: string
  active: boolean
  actions: string[]
}
