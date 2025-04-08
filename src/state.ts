import type { Location } from 'vscode'
import { computed, reactive } from 'reactive-vscode'
import { logger } from './utils'

export const state = reactive({
  locations: [] as Location[],
  excluded: 0,
  symbolText: '',
  currentLocationIndex: 0,
})

export const derivedState = {
  statusText: computed(() => state.locations.length > 0 ? `Symbol ${state.currentLocationIndex + 1} of ${state.locations.length}` : ''),
  statusTooltip: computed(() => state.locations.length > 0 ? `Filtered ${state.excluded} symbol locations` : ''),
}

export function resetState() {
  state.locations = []
  state.excluded = 0
  state.symbolText = ''
  state.currentLocationIndex = 0
}

export function incrementLocationIndex() {
  if (state.locations.length === 0)
    return

  const initialLocationIndex = state.currentLocationIndex
  const nextLocationIndex = (state.currentLocationIndex + 1) % state.locations.length

  state.currentLocationIndex = nextLocationIndex
  logger.info(`incrementLocationIndex: ${initialLocationIndex} -> ${nextLocationIndex}`)

  return state.locations[nextLocationIndex]
}

export function decrementLocationIndex() {
  if (state.locations.length === 0)
    return

  const initialLocationIndex = state.currentLocationIndex
  const prevLocationIndex = (state.currentLocationIndex - 1) % state.locations.length

  state.currentLocationIndex = prevLocationIndex
  logger.info(`decrementLocationIndex: ${initialLocationIndex} -> ${prevLocationIndex}`)

  return state.locations[prevLocationIndex]
}
