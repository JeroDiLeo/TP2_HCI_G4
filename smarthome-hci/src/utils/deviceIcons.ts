import {
  DEFAULT_DEVICE_ICON,
  DEVICE_TYPE_ICONS,
  getDeviceTypeIcon,
} from '@/constants/deviceCatalog'

export interface DeviceVisual {
  icon: string
  bg: string
  fg: string
}

interface DeviceIconEntry extends DeviceVisual {
  match: RegExp
}

const DEVICE_ICON_MAP: DeviceIconEntry[] = [
  { match: /(luc|lámp|lamp|iluminac)/i, icon: 'mdi-lightbulb-outline', bg: '#FEF3C7', fg: '#B45309' },
  { match: /(persian)/i, icon: 'mdi-blinds', bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(aire|temperatura|acond)/i, icon: 'mdi-air-conditioner', bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(puerta|cerradura|bloque)/i, icon: 'mdi-door-closed-lock', bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(alarma)/i, icon: 'mdi-shield-check-outline', bg: '#FEE2E2', fg: 'var(--sh-error)' },
  { match: /(parlante|altavoz|música|musica)/i, icon: 'mdi-speaker', bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(grifo|canilla)/i, icon: 'mdi-faucet', bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(horno)/i, icon: 'mdi-stove', bg: '#FEF3C7', fg: '#B45309' },
  { match: /(heladera|nevera|refriger)/i, icon: 'mdi-fridge-outline', bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
  { match: /(aspirad|robot)/i, icon: 'mdi-robot-vacuum', bg: 'var(--sh-primary-light)', fg: 'var(--sh-primary)' },
]

const DEFAULT_DEVICE_VISUAL: DeviceVisual = {
  icon: DEFAULT_DEVICE_ICON,
  bg: 'var(--sh-primary-light)',
  fg: 'var(--sh-primary)',
}

export function getDeviceVisual(text = ''): DeviceVisual {
  for (const entry of DEVICE_ICON_MAP) {
    if (entry.match.test(text)) {
      return { icon: entry.icon, bg: entry.bg, fg: entry.fg }
    }
  }

  return DEFAULT_DEVICE_VISUAL
}

export function getDeviceIcon(type = '', fallback = DEFAULT_DEVICE_VISUAL.icon): string {
  return getDeviceTypeIcon(type, fallback)
}

export function getRoutineDeviceVisual(typeOrText = ''): DeviceVisual {
  const icon = DEVICE_TYPE_ICONS[typeOrText] ?? getDeviceVisual(typeOrText).icon

  return { icon, bg: '#F1F5F9', fg: 'var(--sh-text-muted)' }
}

export function parseActionString(str: unknown = ''): { device: string, detail: string } {
  if (typeof str !== 'string') {
    return { device: '', detail: '' }
  }

  const parts = str.split('·').map(part => part.trim())

  return {
    device: parts[0] ?? '',
    detail: parts.slice(1).join(' · '),
  }
}
