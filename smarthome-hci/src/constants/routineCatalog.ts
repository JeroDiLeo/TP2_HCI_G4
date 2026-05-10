export interface RoutineCategory {
  value: string
  icon: string
}

export const ROUTINE_CATEGORIES = [
  { value: 'Mañana', icon: 'mdi-white-balance-sunny' },
  { value: 'Noche', icon: 'mdi-weather-night' },
  { value: 'Confort', icon: 'mdi-sofa-outline' },
  { value: 'Seguridad', icon: 'mdi-shield-check' },
  { value: 'Personalizada', icon: 'mdi-cog-outline' },
] as const satisfies readonly RoutineCategory[]

export const DEFAULT_ROUTINE_CATEGORY = ROUTINE_CATEGORIES[0].value
export const DEFAULT_ROUTINE_CATEGORY_ICON = 'mdi-cog-outline'
export const ALL_ROUTINE_CATEGORY = 'Todas'
export const ROUTINE_CATEGORY_VALUES = ROUTINE_CATEGORIES.map(category => category.value)
export const ROUTINE_FILTER_CATEGORIES = [
  ALL_ROUTINE_CATEGORY,
  ...ROUTINE_CATEGORY_VALUES,
] as readonly string[]

export function getRoutineCategoryIcon(category: string): string {
  return ROUTINE_CATEGORIES.find(item => item.value === category)?.icon
    ?? DEFAULT_ROUTINE_CATEGORY_ICON
}
