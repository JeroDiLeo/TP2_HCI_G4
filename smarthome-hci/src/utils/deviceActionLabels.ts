// Traducción de actionNames de API a español para display en UI.
// Los valores originales en inglés no se modifican — esto es solo capa de display.

const ACTION_LABELS: Record<string, string> = {
  turnOn:                'Encender',
  turnOff:               'Apagar',
  start:                 'Iniciar',
  pause:                 'Pausar',
  dock:                  'Volver a la base',
  play:                  'Reproducir',
  stop:                  'Detener',
  open:                  'Abrir',
  close:                 'Cerrar',
  lock:                  'Bloquear',
  unlock:                'Desbloquear',
  setMode:               'Cambiar modo',
  setLocation:           'Enviar a habitación',
  setBrightness:         'Cambiar brillo',
  setColor:              'Cambiar color',
  setTemperature:        'Cambiar temperatura',
  setFreezerTemperature: 'Cambiar temperatura del freezer',
  setFanSpeed:           'Cambiar velocidad del ventilador',
  setVerticalSwing:      'Ajustar aspas verticales',
  setHorizontalSwing:    'Ajustar aspas horizontales',
  setLevel:              'Ajustar nivel',
  setVolume:             'Cambiar volumen',
  dispense:              'Dispensar',
  setHeat:               'Cambiar fuente de calor',
  setGrill:              'Cambiar grill',
  setConvection:         'Cambiar convección',
  setGenre:              'Cambiar género',
  previousSong:          'Canción anterior',
  nextSong:              'Siguiente canción',
  arm:                   'Activar alarma',
  disarm:                'Desactivar alarma',
  changeSecurityCode:    'Cambiar código de seguridad',
}

const SENSITIVE_ACTIONS = new Set(['disarm', 'changeSecurityCode'])

const ALARM_MODES: Record<string, string>  = { armedStay: 'modo casa', armedAway: 'modo fuera de casa' }
const VACUUM_MODES: Record<string, string> = { vacuum: 'aspirar', mop: 'trapear' }
const AC_MODES: Record<string, string>     = { fan: 'ventilación', cool: 'frío', heat: 'calor' }
const FRIDGE_MODES: Record<string, string> = { default: 'normal', party: 'fiesta', vacation: 'vacaciones' }

function translateParamValue(actionName: string, value: unknown): string {
  const s = value == null ? '' : String(value)
  if (actionName === 'arm')     return ALARM_MODES[s]  ?? s
  if (actionName === 'setMode') return VACUUM_MODES[s] ?? AC_MODES[s] ?? FRIDGE_MODES[s] ?? s
  return s
}

export function getActionLabel(actionName: string | null | undefined): string {
  if (!actionName) return ''
  return ACTION_LABELS[actionName] ?? actionName
}

export function formatRoutineActionDetail(
  actionName: string,
  params: unknown[] | null | undefined,
): string {
  const label = getActionLabel(actionName)
  if (!params || params.length === 0) return label
  if (SENSITIVE_ACTIONS.has(actionName)) return label
  if (actionName === 'arm') {
    const raw = params[0]
    if (raw == null || raw === '') return label
    return `${label}: ${ALARM_MODES[String(raw)] ?? String(raw)}`
  }
  const safe = params
    .filter(p => p !== null && p !== undefined && p !== '')
    .map(p => translateParamValue(actionName, p))
  return safe.length ? `${label}: ${safe.join(', ')}` : label
}
