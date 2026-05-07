//PROVISIONAL — reemplazar cuando se integren las tarjetas/íconos
// definitivos por tipo de dispositivo (branch en paralelo). Una vez
// disponible el sistema unificado, migrar los imports en
// EditActionsSubModal.vue y EditRoutineModal.vue y borrar este archivo.


const DEVICE_ICON_MAP = [
  { match: /(luc|lámp|lamp|iluminac)/i,    icon: 'mdi-lightbulb-outline',      bg: '#FEF3C7', fg: '#B45309' },
  { match: /(persian)/i,                   icon: 'mdi-blinds',                 bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(aire|temperatura|acond)/i,    icon: 'mdi-air-conditioner',        bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(puerta|cerradura|bloque)/i,   icon: 'mdi-door-closed-lock',       bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(alarma)/i,                    icon: 'mdi-shield-check-outline',   bg: '#FEE2E2', fg: 'var(--sh-error)' },
  { match: /(parlante|altavoz|música|musica)/i, icon: 'mdi-speaker',           bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(grifo|canilla)/i,             icon: 'mdi-faucet',                 bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(horno)/i,                     icon: 'mdi-stove',                  bg: '#FEF3C7', fg: '#B45309' },
  { match: /(heladera|nevera|refriger)/i,  icon: 'mdi-fridge-outline',         bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(aspirad|robot)/i,             icon: 'mdi-robot-vacuum',           bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
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
