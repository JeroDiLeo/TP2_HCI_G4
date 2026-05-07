import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RoutineTrigger {
  type: 'schedule' | 'manual'
  time?: string
}

export interface Routine {
  id: string
  name: string
  description: string
  category: string
  icon: string
  trigger: RoutineTrigger
  actions: string[]
  days: string[]
}

const MOCK_ROUTINES: Routine[] = [
  {
    id: 'r1', name: 'Buenos Días', description: 'Despierta con el ambiente perfecto',
    category: 'Mañana', icon: 'mdi-white-balance-sunny',
    trigger: { type: 'schedule', time: '07:00' },
    actions: [
      'Luces Sala · Encender (50%)',
      'Aire Acond. · Ajustar a 22°C',
      'Persiana · Abrir (100%)',
      'Parlante · Reproducir música',
    ],
    days: ['lun', 'mar', 'mie', 'jue', 'vie'],
  },
  {
    id: 'r2', name: 'Buenas Noches', description: 'Prepara tu casa para dormir',
    category: 'Noche', icon: 'mdi-weather-night',
    trigger: { type: 'schedule', time: '22:00' },
    actions: [
      'Todas las luces · Apagar',
      'Aire Acond. · Ajustar a 20°C',
      'Puerta principal · Bloquear',
      'Alarma · Activar',
    ],
    days: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
  },
  {
    id: 'r3', name: 'Modo Película', description: 'Configura la sala para una buena peli',
    category: 'Confort', icon: 'mdi-movie-open',
    trigger: { type: 'manual' },
    actions: [
      'Luces Sala · Atenuar (20%)',
      'Persiana · Cerrar',
      'Parlante · Encender',
    ],
    days: [],
  },
  {
    id: 'r4', name: 'Modo Ahorro', description: 'Reduce el consumo energético',
    category: 'Personalizada', icon: 'mdi-leaf',
    trigger: { type: 'schedule', time: '23:00' },
    actions: [
      'Luces · Atenuar (50%)',
      'Aire Acond. · Ajustar a 25°C',
      'Heladera · Modo eco (6°C)',
    ],
    days: ['mie', 'jue', 'vie'],
  },
  {
    id: 'r5', name: 'Seguridad Nocturna', description: 'Asegura la casa antes de dormir',
    category: 'Seguridad', icon: 'mdi-shield-check',
    trigger: { type: 'schedule', time: '23:00' },
    actions: [
      'Alarma · Activar',
      'Puerta · Bloquear',
      'Luces exteriores · Encender (30%)',
    ],
    days: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
  },
  {
    id: 'r6', name: 'Hora del Café', description: 'Prepara el ambiente para tu café',
    category: 'Confort', icon: 'mdi-coffee',
    trigger: { type: 'schedule', time: '15:00' },
    actions: [
      'Luces Cocina · Encender (70%)',
      'Parlante · Reproducir música',
    ],
    days: ['sab', 'dom'],
  },
]

export const useRoutinesStore = defineStore('routines', () => {
  const routines = ref<Routine[]>(JSON.parse(JSON.stringify(MOCK_ROUTINES)))

  function addRoutine(data: Omit<Routine, 'id'>) {
    const routine: Routine = {
      ...JSON.parse(JSON.stringify(data)),
      id: `r${Date.now()}`,
    }
    routines.value.push(routine)
    return routine
  }

  function updateRoutine(id: string, patch: Partial<Routine>) {
    const idx = routines.value.findIndex(r => r.id === id)
    if (idx >= 0) routines.value[idx] = { ...routines.value[idx], ...patch }
  }

  function removeRoutine(id: string) {
    routines.value = routines.value.filter(r => r.id !== id)
  }

  function duplicateRoutine(id: string) {
    const orig = routines.value.find(r => r.id === id)
    if (!orig) return
    routines.value.push({
      ...JSON.parse(JSON.stringify(orig)),
      id: `r${Date.now()}`,
      name: `${orig.name} (copia)`,
    })
  }

  // No-op visual: la integración real con dispositivos viene después.
  function executeRoutine(_id: string) {}

  return { routines, addRoutine, updateRoutine, removeRoutine, duplicateRoutine, executeRoutine }
})
