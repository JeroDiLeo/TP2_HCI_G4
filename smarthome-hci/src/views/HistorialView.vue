<template>
  <div class="historial-view">
    <!-- Header -->
    <div class="historial-header">
      <div>
        <h1 class="historial-header__title">Historial</h1>
        <p class="historial-header__subtitle">Acciones realizadas con tus dispositivos</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="historial-stats">
      <div class="stat-card">
        <div class="stat-card__icon" style="--icon-bg: #EDE9FE">
          <i class="mdi mdi-flash"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ stats.actionsToday }}</div>
          <div class="stat-card__label">Acciones hoy</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon" style="--icon-bg: #EDE9FE">
          <i class="mdi mdi-refresh"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ stats.byRoutines }}</div>
          <div class="stat-card__label">Por rutinas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon" style="--icon-bg: #EDE9FE">
          <i class="mdi mdi-gesture-tap"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ stats.manual }}</div>
          <div class="stat-card__label">Manuales</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon" style="--icon-bg: #EDE9FE">
          <i class="mdi mdi-clock-outline"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ stats.lastActionTime }}</div>
          <div class="stat-card__label">Última acción</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <HistorialFilters
      :selected-room="selectedRoom"
      :selected-period="selectedPeriod"
      :selected-action="selectedAction"
      :selected-origin="selectedOrigin"
      @update-room="selectedRoom = $event"
      @update-period="selectedPeriod = $event"
      @update-action="selectedAction = $event"
      @update-origin="selectedOrigin = $event"
    />

    <!-- Events List -->
    <div class="historial-events">
      <template v-for="group in groupedEvents" :key="group.date">
        <div class="events-date-header">
          <h3 class="events-date-title">{{ group.dateLabel }}</h3>
          <span class="events-count">{{ group.events.length }} eventos</span>
        </div>

        <HistorialEventItem
          v-for="event in group.events"
          :key="event.id"
          :event="event"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import HistorialFilters from '@/components/historial/HistorialFilters.vue'
import HistorialEventItem from '@/components/historial/HistorialEventItem.vue'

const selectedRoom = ref('Todas')
const selectedPeriod = ref('Hoy')
const selectedAction = ref('Todas las acciones')
const selectedOrigin = ref('Todos')

function getCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

const events = ref([
  {
    id: '1',
    action: 'Se abrió',
    device: 'Persiana',
    room: 'Sala de Estar',
    status: 'Abierta 100%',
    routine: 'Buenos Días',
    user: 'Test User',
    actionType: 'Apertura',
    actionColor: '#3B82F6',
    icon: 'mdi-blinds-open',
    time: '10:48',
    date: '2026-05-07',
  },
  {
    id: '2',
    action: 'Se encendió',
    device: 'Aire acondicionado',
    room: 'Habitación Principal',
    status: '24°C · Modo automático',
    user: 'Test User',
    actionType: 'Encendido',
    actionColor: '#10B981',
    icon: 'mdi-air-conditioner',
    time: '14:32',
    date: '2026-05-07',
  },
  {
    id: '3',
    action: 'Se ajustó',
    device: 'Luz Principal',
    room: 'Sala de Estar',
    status: 'Intensidad 75%',
    user: 'Test User',
    actionType: 'Ajuste',
    actionColor: '#3B82F6',
    icon: 'mdi-lightbulb',
    time: '14:18',
    date: '2026-05-07',
  },
  {
    id: '4',
    action: 'Se desbloqueó',
    device: 'Puerta Principal',
    room: 'Entrada',
    status: 'Acceso por código',
    user: 'Test User',
    actionType: 'Desbloqueo',
    actionColor: '#A78BFA',
    icon: 'mdi-lock-open',
    time: '13:45',
    date: '2026-05-07',
  },
  {
    id: '5',
    action: 'Rutina ejecutada',
    device: 'Buenos Días',
    room: null,
    status: '3 acciones realizadas',
    actionType: 'Rutina',
    actionColor: '#8B5CF6',
    icon: 'mdi-play-circle-outline',
    time: '07:00',
    date: '2026-05-07',
    isRoutine: true,
    actions: [
      {
        action: 'Se abrió',
        device: 'Persiana',
        room: 'Sala de Estar',
        detail: 'Abierta 100%',
        icon: 'mdi-blinds-open',
      },
      {
        action: 'Se encendió',
        device: 'Luz Principal',
        room: 'Habitación Principal',
        detail: 'Intensidad 100%',
        icon: 'mdi-lightbulb',
      },
      {
        action: 'Se apagó',
        device: 'Aire acondicionado',
        room: 'Habitación Principal',
        detail: 'Desactivado',
        icon: 'mdi-air-conditioner',
      },
    ],
  },
  {
    id: '6',
    action: 'Se encendió',
    device: 'Luz Principal',
    room: 'Sala de Estar',
    status: 'Intensidad 50%',
    user: 'Test User',
    actionType: 'Encendido',
    actionColor: '#10B981',
    icon: 'mdi-lightbulb',
    time: '22:45',
    date: '2026-05-06',
  },
  {
    id: '7',
    action: 'Rutina ejecutada',
    device: 'Noche',
    room: null,
    status: '2 acciones realizadas',
    actionType: 'Rutina',
    actionColor: '#8B5CF6',
    icon: 'mdi-play-circle-outline',
    time: '22:15',
    date: '2026-05-08',
    isRoutine: true,
    actions: [
      {
        action: 'Se apagó',
        device: 'Luz Principal',
        room: 'Sala de Estar',
        detail: 'Apagado',
        icon: 'mdi-lightbulb',
      },
      {
        action: 'Se bloqueó',
        device: 'Puerta Principal',
        room: 'Entrada',
        detail: 'Bloqueado',
        icon: 'mdi-lock',
      },
    ],
  },
  {
    id: '8',
    action: 'Se apagó',
    device: 'Televisor',
    room: 'Sala de Estar',
    status: 'Apagado',
    user: 'Test User',
    actionType: 'Apagado',
    actionColor: '#6B7280',
    icon: 'mdi-television',
    time: '23:30',
    date: '2026-05-06',
  },
])

const stats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayEvents = events.value.filter((event) => event.date === today)

  let actionsToday = 0
  let byRoutines = 0
  let manual = 0

  todayEvents.forEach((event) => {
    if (event.isRoutine) {
      const actionCount = event.actions?.length ?? 0
      actionsToday += actionCount
      byRoutines += actionCount
    } else {
      actionsToday += 1
      manual += 1
    }
  })

  // Última acción muestra la hora del evento más reciente
  const lastAction = [...events.value].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time}`)
    const timeB = new Date(`${b.date}T${b.time}`)
    return timeB - timeA
  })[0]

  const lastActionTime = lastAction?.time ?? '--:--'

  return {
    actionsToday,
    byRoutines,
    manual,
    lastActionTime,
  }
})

const filteredEvents = computed(() => {
  return events.value.filter((event) => {
    // Filter by room
    if (selectedRoom.value !== 'Todas') {
      if (!event.room || !event.room.includes(selectedRoom.value)) {
        return false
      }
    }

    // Filter by period
    if (selectedPeriod.value !== 'Todo') {
      const eventDate = new Date(event.date)
      const today = new Date()
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)

      if (selectedPeriod.value === 'Hoy') {
        const todayStr = today.toISOString().split('T')[0]
        if (event.date !== todayStr) return false
      } else if (selectedPeriod.value === 'Esta semana') {
        if (eventDate < weekAgo) return false
      } else if (selectedPeriod.value === 'Este mes') {
        if (eventDate < monthAgo) return false
      }
    }

    // Filter by action
    if (
      selectedAction.value !== 'Todas las acciones' &&
      event.actionType !== selectedAction.value
    ) {
      return false
    }

    // Filter by origin (manual vs routine)
    if (selectedOrigin.value !== 'Todos') {
      if (selectedOrigin.value === 'Rutina' && !event.isRoutine) return false
      if (selectedOrigin.value === 'Manual' && event.isRoutine) return false
    }

    return true
  })
})

const groupedEvents = computed(() => {
  const grouped = {}

  filteredEvents.value.forEach((event) => {
    const dateKey = event.date
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        dateLabel: formatDateLabel(dateKey),
        events: [],
      }
    }
    grouped[dateKey].events.push(event)
  })

  return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date))
})

function formatDateLabel(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayStr = today.toISOString().split('T')[0]
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (dateStr === todayStr) {
    return 'Hoy'
  } else if (dateStr === yesterdayStr) {
    return 'Ayer'
  } else {
    const opts = { weekday: 'long', day: 'numeric', month: 'short' }
    return date.toLocaleDateString('es-ES', opts).replace(/^\w/, (c) => c.toUpperCase())
  }
}

// Trigger re-render cada minuto para que la hora se actualice
const currentTime = ref(getCurrentTime())
let timeInterval

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = getCurrentTime()
  }, 60000) // Actualizar cada minuto
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
.historial-view {
  padding: 0;
}

.historial-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  padding: 0 24px;
}

.historial-header__title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
}

.historial-header__subtitle {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}


.historial-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 0 24px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid var(--sh-border);
  border-radius: 12px;
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: var(--icon-bg);
  color: #7C3AED;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-card__content {
  flex: 1;
}

.stat-card__value {
  font-size: 20px;
  font-weight: 700;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
}

.stat-card__label {
  font-size: 12px;
  color: var(--sh-text-muted);
  margin-top: 2px;
  font-family: var(--sh-font);
}

.historial-events {
  padding: 0 24px;
}

.events-date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28px;
  margin-bottom: 12px;
  padding: 0;
}

.events-date-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--sh-text-main);
  font-family: var(--sh-font);
}

.events-count {
  font-size: 13px;
  color: var(--sh-text-muted);
  font-family: var(--sh-font);
}

@media (max-width: 768px) {
  .historial-view {
    padding: 0;
  }

  .historial-header {
    flex-direction: column;
    padding: 0 16px;
    margin-bottom: 24px;
  }

  .historial-stats {
    padding: 0 16px;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .historial-events {
    padding: 0 16px;
  }
}
</style>
