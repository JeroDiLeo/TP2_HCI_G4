import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRoomsByHome } from '@/services/api/roomApi'
import type { RoomDevice } from '@/types/rooms'

export interface Room {
  id: number | string
  name: string
  type?: string
  devicesTotal?: number
  devicesActive?: number
  home?: { id: string }
  metadata?: Record<string, unknown>
}

// ── Initial device data ──────────────────────────────────────────────
// active = true means the device is currently operational and counts
// toward devicesActive. Semantics per type:
//   light / ac / oven / speaker / vacuum → powered on
//   door                                 → locked (security actively engaged)
//   alarm                                → alarmMode !== 'desactivada'
//   faucet                               → open (valve is open)
//   blind                                → position > 0 (open or partially open)
//   fridge                               → false by default (always running but not "in use")
const INITIAL_DEVICES: Record<string, RoomDevice[]> = {
  '1': [ // Sala de Estar → 3 active
    {
      id: 101, name: 'Lámpara Principal', type: 'light', active: true,
      roomId: 1, roomName: 'Sala de Estar', color: '#FCD34D', intensity: 75,
    },
    {
      id: 102, name: 'Parlante', type: 'speaker', active: true,
      roomId: 1, roomName: 'Sala de Estar',
      volume: 5, playing: true, genre: 'pop',
      currentSong: 'Blinding Lights', timestamp: '2:34',
    },
    {
      id: 103, name: 'Aspiradora', type: 'vacuum', active: true,
      roomId: 1, roomName: 'Sala de Estar',
      vacuumStatus: 'encendida', vacuumMode: 'aspirar',
      targetRoomId: 1, targetRoomName: 'Sala de Estar',
    },
    {
      id: 104, name: 'Persiana', type: 'blind', active: false,
      roomId: 1, roomName: 'Sala de Estar', position: 0, blindStatus: 'cerrada',
    },
  ],

  '2': [ // Habitación Principal → 2 active
    {
      id: 201, name: 'Lámpara Ambiente', type: 'light', active: true,
      roomId: 2, roomName: 'Habitación Principal', color: '#93C5FD', intensity: 45,
    },
    {
      id: 202, name: 'Aire Acondicionado', type: 'ac', active: true,
      roomId: 2, roomName: 'Habitación Principal',
      temperature: 22, mode: 'frío',
      verticalBlades: 'automático', horizontalBlades: 'automático', fanSpeed: 'automático',
    },
    {
      id: 203, name: 'Persiana', type: 'blind', active: false,
      roomId: 2, roomName: 'Habitación Principal', position: 0, blindStatus: 'cerrada',
    },
    {
      id: 204, name: 'Parlante', type: 'speaker', active: false,
      roomId: 2, roomName: 'Habitación Principal',
      volume: 3, playing: false, genre: 'clásica',
      currentSong: 'Moonlight Sonata', timestamp: '0:00',
    },
  ],

  '3': [ // Cocina → 1 active
    {
      id: 301, name: 'Horno', type: 'oven', active: true,
      roomId: 3, roomName: 'Cocina',
      temperature: 180, heatSource: 'convencional',
      grillMode: 'apagado', convectionMode: 'apagado',
    },
    {
      id: 302, name: 'Heladera', type: 'fridge', active: false,
      roomId: 3, roomName: 'Cocina',
      fridgeTemp: 4, freezerTemp: -18, fridgeMode: 'normal',
    },
    {
      id: 303, name: 'Grifo', type: 'faucet', active: false,
      roomId: 3, roomName: 'Cocina',
      open: false, quantity: 100, unit: 'ml', dispensed: 0,
    },
    {
      id: 304, name: 'Lámpara', type: 'light', active: false,
      roomId: 3, roomName: 'Cocina', color: '#FFFFFF', intensity: 100,
    },
  ],

  '4': [ // Habitación de Tomi → 0 active
    {
      id: 401, name: 'Lámpara', type: 'light', active: false,
      roomId: 4, roomName: 'Habitación de Tomi', color: '#FCD34D', intensity: 50,
    },
    {
      id: 402, name: 'Persiana', type: 'blind', active: false,
      roomId: 4, roomName: 'Habitación de Tomi', position: 0, blindStatus: 'cerrada',
    },
    {
      id: 403, name: 'Parlante', type: 'speaker', active: false,
      roomId: 4, roomName: 'Habitación de Tomi',
      volume: 5, playing: false, genre: 'rock',
      currentSong: 'Bohemian Rhapsody', timestamp: '0:00',
    },
    {
      id: 404, name: 'Aire Acondicionado', type: 'ac', active: false,
      roomId: 4, roomName: 'Habitación de Tomi',
      temperature: 24, mode: 'frío',
      verticalBlades: 'automático', horizontalBlades: 'automático', fanSpeed: 'automático',
    },
  ],

  '5': [ // Baño Principal → 0 active (door unlocked/inactive)
    {
      id: 501, name: 'Lámpara', type: 'light', active: false,
      roomId: 5, roomName: 'Baño Principal', color: '#FFFFFF', intensity: 100,
    },
    {
      id: 502, name: 'Grifo', type: 'faucet', active: false,
      roomId: 5, roomName: 'Baño Principal',
      open: false, quantity: 50, unit: 'ml', dispensed: 0,
    },
    {
      id: 503, name: 'Persiana', type: 'blind', active: false,
      roomId: 5, roomName: 'Baño Principal', position: 0, blindStatus: 'cerrada',
    },
    {
      id: 504, name: 'Puerta', type: 'door', active: false,
      roomId: 5, roomName: 'Baño Principal', open: false, locked: false,
    },
  ],

  '6': [ // Oficina → 2 active (door locked + alarm armed)
    {
      id: 601, name: 'Puerta', type: 'door', active: true,
      roomId: 6, roomName: 'Oficina', open: false, locked: true,
    },
    {
      id: 602, name: 'Alarma', type: 'alarm', active: true,
      roomId: 6, roomName: 'Oficina', alarmMode: 'modo regular', code: '1234',
    },
    {
      id: 603, name: 'Lámpara', type: 'light', active: false,
      roomId: 6, roomName: 'Oficina', color: '#EFF6FF', intensity: 80,
    },
    {
      id: 604, name: 'Aire Acondicionado', type: 'ac', active: false,
      roomId: 6, roomName: 'Oficina',
      temperature: 22, mode: 'ventilación',
      verticalBlades: 'automático', horizontalBlades: 'automático', fanSpeed: 'automático',
    },
  ],
}

// Base room list without stats — counts are derived reactively from roomDevices
const ROOM_BASES: Room[] = [
  { id: 1, name: 'Sala de Estar',        type: 'living'   },
  { id: 2, name: 'Habitación Principal', type: 'bedroom'  },
  { id: 3, name: 'Cocina',               type: 'kitchen'  },
  { id: 4, name: 'Habitación de Tomi',   type: 'bedroom'  },
  { id: 5, name: 'Baño Principal',       type: 'bathroom' },
  { id: 6, name: 'Oficina',              type: 'office'   },
]

// ── Store ────────────────────────────────────────────────────────────
export const useRoomsStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([...ROOM_BASES])
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // String-keyed so ids are compared as strings throughout
  const roomDevices = ref<Record<string, RoomDevice[]>>(
    Object.fromEntries(
      Object.entries(INITIAL_DEVICES).map(([k, v]) => [k, v.map(d => ({ ...d }))])
    )
  )

  // ── Stats derived reactively from roomDevices ──
  function getRoomDeviceStats(id: number | string) {
    const list = roomDevices.value[String(id)] ?? []
    return { total: list.length, active: list.filter(d => d.active).length }
  }

  // rooms exposed to the rest of the app include live stats
  const roomsWithStats = computed<Room[]>(() =>
    rooms.value.map(r => {
      const stats = getRoomDeviceStats(r.id)
      return { ...r, devicesTotal: stats.total, devicesActive: stats.active }
    })
  )

  const totalRooms = computed(() => rooms.value.length)

  const activeDevices = computed(() =>
    Object.values(roomDevices.value).flat().filter(d => d.active).length
  )

  const filteredRooms = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    const source = roomsWithStats.value
    if (!q) return source
    return source.filter(r => r.name.toLowerCase().includes(q))
  })

  function getRoomById(id: number | string): Room | undefined {
    return roomsWithStats.value.find(r => String(r.id) === String(id))
  }

  function getRoomDevices(id: number | string): RoomDevice[] {
    return roomDevices.value[String(id)] ?? []
  }

  function updateRoomDevice(
    roomId: number | string,
    deviceId: number,
    patch: Partial<RoomDevice>
  ) {
    const list = roomDevices.value[String(roomId)]
    if (!list) return
    const idx = list.findIndex(d => d.id === deviceId)
    if (idx !== -1) Object.assign(list[idx], patch)
  }

  function addRoom({ name, type }: { name: string; type?: string }) {
    rooms.value.push({ id: Date.now(), name, type })
  }

  function removeRoom(id: number | string) {
    rooms.value = rooms.value.filter(r => String(r.id) !== String(id))
  }

  async function fetchRoomsByHome(homeId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await getRoomsByHome(homeId)
      rooms.value = data
    } catch (err: unknown) {
      error.value = (err as Error).message ?? 'Error al cargar las habitaciones'
    } finally {
      loading.value = false
    }
  }

  function clearRooms() {
    rooms.value = []
    error.value = null
  }

  return {
    rooms: roomsWithStats,
    searchQuery, loading, error,
    totalRooms, activeDevices, filteredRooms,
    getRoomById, getRoomDevices, getRoomDeviceStats, updateRoomDevice,
    addRoom, removeRoom, fetchRoomsByHome, clearRooms,
  }
})
