

export interface ApiRoutineAction {
  device: { id: string }
  actionName: string
  params: unknown[]
}

export interface ApiRoutineMetadata {
  description?: string
  category?: string
  icon?: string
  schedule?: {
    time?: string   // "HH:mm"
    days?: number[] // 0 = lun ... 6 = dom
  } | null
  homeId?: string | null
  favorite?: boolean
  [key: string]: unknown
}

export interface ApiRoutine {
  id: string
  name: string
  actions: ApiRoutineAction[]
  metadata: ApiRoutineMetadata
}


export interface FrontRoutineAction {
  device: { id: string }
  actionName: string
  params: unknown[]
}

export interface FrontRoutine {
  id: string
  name: string
  description: string
  category: string
  icon: string
  trigger: { type: 'schedule' | 'manual'; time?: string }
  actions: FrontRoutineAction[]
  days: string[]
  favorite: boolean
  homeId: string | null
}


const DAYS_FRONT_TO_API: Record<string, number> = {
  lun: 0,
  mar: 1,
  mie: 2,
  jue: 3,
  vie: 4,
  sab: 5,
  dom: 6,
}

const DAYS_API_TO_FRONT: Record<number, string> = {
  0: 'lun',
  1: 'mar',
  2: 'mie',
  3: 'jue',
  4: 'vie',
  5: 'sab',
  6: 'dom',
}



export function fromApi(apiRoutine: ApiRoutine): FrontRoutine {
  const meta = apiRoutine.metadata ?? {}
  const schedule = meta.schedule ?? null
  const hasSchedule = !!(schedule?.time)

  return {
    id: apiRoutine.id,
    name: apiRoutine.name,
    actions: (apiRoutine.actions ?? []) as FrontRoutineAction[],
    description: meta.description ?? '',
    category: meta.category ?? 'Personalizada',
    icon: meta.icon ?? 'mdi-flash-outline',
    trigger: hasSchedule
      ? { type: 'schedule', time: schedule!.time }
      : { type: 'manual' },
    days: hasSchedule
      ? (schedule!.days ?? [])
          .map(d => DAYS_API_TO_FRONT[d])
          .filter(Boolean)
      : [],
    favorite: meta.favorite ?? false,
    homeId: meta.homeId ?? null,
  }
}


export function toApi(
  frontRoutine: Omit<FrontRoutine, 'id'>,
): Omit<ApiRoutine, 'id'> {
  const hasSchedule =
    frontRoutine.trigger.type === 'schedule' && !!frontRoutine.trigger.time

  return {
    name: frontRoutine.name,
    actions: frontRoutine.actions ?? [],
    metadata: {
      description: frontRoutine.description,
      category: frontRoutine.category,
      icon: frontRoutine.icon,
      ...(hasSchedule
        ? {
            schedule: {
              time: frontRoutine.trigger.time,
              days: frontRoutine.days
                .map(d => DAYS_FRONT_TO_API[d])
                .filter(d => d !== undefined),
            },
          }
        : { schedule: null }),
      homeId: frontRoutine.homeId,
      favorite: frontRoutine.favorite,
    },
  }
}
