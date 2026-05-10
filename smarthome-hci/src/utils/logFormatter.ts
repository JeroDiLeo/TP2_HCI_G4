import type { LogEntry } from '@/types/logs'

// API-value → display-value maps.
// These mirror the *_API_TO_FRONT constants in deviceMapper.ts, which are not
// exported from there. If those constants are ever exported, import them here
// instead of maintaining duplicates.
const AC_MODE: Record<string, string>         = { fan: 'ventilación', cool: 'frío', heat: 'calor' }
const AC_SWING: Record<string, string>        = { auto: 'automático' }
const AC_FAN: Record<string, string>          = { auto: 'automático' }
const VACUUM_MODE: Record<string, string>     = { vacuum: 'aspirar', mop: 'trapear' }
const FRIDGE_MODE: Record<string, string>     = { 'default': 'normal', party: 'fiesta', vacation: 'vacaciones' }
const SPEAKER_GENRE: Record<string, string>   = {
  classical: 'clásica', country: 'country', dance: 'dance',
  latina: 'latina', pop: 'pop', rock: 'rock',
}
const OVEN_HEAT: Record<string, string>       = { conventional: 'convencional', bottom: 'abajo', top: 'arriba' }
const OVEN_GRILL: Record<string, string>      = { off: 'apagado', eco: 'económico', large: 'completo' }
const OVEN_CONVECTION: Record<string, string> = { off: 'apagado', eco: 'económico', normal: 'convencional' }
const ALARM_MODE: Record<string, string>      = { armedStay: 'Estar en casa', armedAway: 'Fuera de casa' }

/**
 * Strips params that must never appear in the UI.
 * arm:                keep only params[0] (mode), drop params[1]+ (security code).
 * disarm:             drop all params (code only).
 * changeSecurityCode: drop all params (old/new codes).
 * Everything else:    drop null/undefined values.
 */
function sanitizeParams(actionName: string, params: unknown[]): unknown[] {
  if (actionName === 'arm')                return params.slice(0, 1)
  if (actionName === 'disarm')             return []
  if (actionName === 'changeSecurityCode') return []
  return params.filter(p => p !== undefined && p !== null)
}

function str(value: unknown): string {
  return value == null ? '' : String(value)
}

/**
 * Converts a LogEntry to a human-readable Spanish string.
 *
 * @param catalogDescription - optional action description from the device-types
 *   catalog (DeviceAction.description). Used as fallback before the generic
 *   "Acción: {name}" label when the actionName is not mapped here.
 */
export function formatLogAction(entry: LogEntry, catalogDescription?: string): string {
  const { actionName, params, deviceType } = entry
  const safe = sanitizeParams(actionName, params)
  const p0 = str(safe[0])
  const p1 = str(safe[1])

  if (actionName === 'turnOn')             return 'Encendido'
  if (actionName === 'turnOff')            return 'Apagado'
  if (actionName === 'play')               return 'Reproduciendo'
  if (actionName === 'stop')               return 'Detenido'
  if (actionName === 'pause')              return 'Pausado'
  if (actionName === 'start')              return 'Iniciado'
  if (actionName === 'dock')               return 'Volviendo a la base'
  if (actionName === 'open')               return 'Abierto'
  if (actionName === 'close')              return 'Cerrado'
  if (actionName === 'lock')               return 'Bloqueado'
  if (actionName === 'unlock')             return 'Desbloqueado'
  if (actionName === 'previousSong')       return 'Canción anterior'
  if (actionName === 'nextSong')           return 'Siguiente canción'
  if (actionName === 'changeSecurityCode') return 'Código de alarma actualizado'
  if (actionName === 'disarm')             return 'Alarma desactivada'

  if (actionName === 'setBrightness')
    return p0 ? `Brillo cambiado a ${p0}%` : 'Brillo ajustado'
  if (actionName === 'setColor')
    return p0 ? `Color cambiado a ${p0}` : 'Color ajustado'
  if (actionName === 'setVolume')
    return p0 ? `Volumen ajustado a ${p0}` : 'Volumen ajustado'
  if (actionName === 'setLevel')
    return p0 ? `Nivel ajustado a ${p0}%` : 'Nivel ajustado'
  if (actionName === 'setTemperature')
    return p0 ? `Temperatura ajustada a ${p0}°C` : 'Temperatura ajustada'
  if (actionName === 'setFreezerTemperature')
    return p0 ? `Temperatura del freezer ajustada a ${p0}°C` : 'Temperatura del freezer ajustada'

  if (actionName === 'setFanSpeed') {
    const label = AC_FAN[p0] ?? p0
    return label ? `Velocidad del ventilador: ${label}` : 'Velocidad del ventilador ajustada'
  }
  if (actionName === 'setVerticalSwing') {
    const label = AC_SWING[p0] ?? p0
    return label ? `Paleta vertical: ${label}` : 'Paleta vertical ajustada'
  }
  if (actionName === 'setHorizontalSwing') {
    const label = AC_SWING[p0] ?? p0
    return label ? `Paleta horizontal: ${label}` : 'Paleta horizontal ajustada'
  }
  if (actionName === 'setGenre') {
    const label = SPEAKER_GENRE[p0] ?? p0
    return label ? `Género musical: ${label}` : 'Género ajustado'
  }
  if (actionName === 'setLocation')
    return p0 ? `Enviada a ${p0}` : 'Ubicación asignada'
  if (actionName === 'dispense')
    return p0 ? `Dispensado ${p0}${p1 ? ' ' + p1 : ''}` : 'Dispensado'
  if (actionName === 'setHeat') {
    const label = OVEN_HEAT[p0] ?? p0
    return label ? `Fuente de calor: ${label}` : 'Fuente de calor ajustada'
  }
  if (actionName === 'setGrill') {
    const label = OVEN_GRILL[p0] ?? p0
    return label ? `Grill: ${label}` : 'Grill ajustado'
  }
  if (actionName === 'setConvection') {
    const label = OVEN_CONVECTION[p0] ?? p0
    return label ? `Convección: ${label}` : 'Convección ajustada'
  }
  if (actionName === 'arm') {
    const modeLabel = ALARM_MODE[p0] ?? p0
    return `Alarma activada — ${modeLabel || 'modo desconocido'}`
  }
  if (actionName === 'setMode') {
    let label: string
    if (deviceType === 'ac')          label = AC_MODE[p0] ?? p0
    else if (deviceType === 'vacuum') label = VACUUM_MODE[p0] ?? p0
    else if (deviceType === 'fridge') label = FRIDGE_MODE[p0] ?? p0
    else                              label = p0
    return label ? `Modo: ${label}` : 'Modo cambiado'
  }

  const displayParams = safe.length ? ` (${JSON.stringify(safe)})` : ''
  if (catalogDescription) return `${catalogDescription}${displayParams}`
  return `Acción: ${actionName}${displayParams}`
}

export function formatRelativeTime(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSec < 0)   return 'en unos momentos'
  if (diffSec < 60)  return 'hace un momento'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60)  return `hace ${diffMin} min`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24)   return `hace ${diffHr} h`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return 'ayer'
  if (diffDay < 7)   return `hace ${diffDay} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function formatAbsoluteTime(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
