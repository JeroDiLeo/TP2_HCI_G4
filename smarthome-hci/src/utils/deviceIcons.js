//PROVISIONAL — reemplazar cuando se integren las tarjetas/íconos
// definitivos por tipo de dispositivo (branch en paralelo). Una vez
// disponible el sistema unificado, migrar los imports en
// EditActionsSubModal.vue y EditRoutineModal.vue y borrar este archivo.


const DEVICE_ICON_MAP = [
  { match: /(luc|lámp|lamp|iluminac)/i,  icon: 'mdi-lightbulb-outline',     bg: '#FEF3C7', fg: '#B45309' },
  { match: /(cortina|persian)/i,          icon: 'mdi-blinds',               bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(climatiz|aire|temperatura|termo)/i, icon: 'mdi-thermostat',    bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(tv|televis)/i,               icon: 'mdi-television',           bg: '#F1F5F9', fg: 'var(--sh-text-muted)' },
  { match: /(puerta|cerradura|bloque)/i,  icon: 'mdi-door-closed-lock',     bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(cámara|camara|cctv)/i,       icon: 'mdi-cctv',                 bg: '#FEE2E2', fg: 'var(--sh-error)' },
  { match: /(alarma|sensor|seguridad)/i,  icon: 'mdi-shield-check-outline', bg: '#FEE2E2', fg: 'var(--sh-error)' },
  { match: /(café|cafe|cafetera)/i,       icon: 'mdi-coffee',               bg: '#FEF3C7', fg: '#B45309' },
]

const DEFAULT = {
  icon: 'mdi-power-plug-outline',
  bg:   'var(--sh-primary-light)',
  fg:   'var(--sh-primary)',
}

export function getDeviceVisual(text) {
  if (!text) return DEFAULT
  for (const entry of DEVICE_ICON_MAP) {
    if (entry.match.test(text)) {
      return { icon: entry.icon, bg: entry.bg, fg: entry.fg }
    }
  }
  return DEFAULT
}

// Parsea un string de acción tipo "Luces Sala · Encender (50%)" en
// { device: 'Luces Sala', detail: 'Encender (50%)' }.
export function parseActionString(str) {
  if (typeof str !== 'string') return { device: '', detail: '' }
  const parts = str.split('·').map(s => s.trim())
  return {
    device: parts[0] ?? '',
    detail: parts.slice(1).join(' · '),
  }
}
