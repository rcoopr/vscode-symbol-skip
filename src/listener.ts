import type { Disposable, TextEditorSelectionChangeEvent } from 'vscode'
import { resetState, state } from './state'

export const listeners = {
  selection: undefined as Disposable | undefined,
}

export function checkForSelectionChange(event: TextEditorSelectionChangeEvent) {
  const selection = event.selections[0]

  // Bug? listener triggers repeatedly with ever increasing line number
  // event.textEditor.document.lineCount is always 1 more than the last line number
  if (selection.start.line >= event.textEditor.document.lineCount - 1) {
    return
  }

  const currentLocation = state.locations[state.currentLocationIndex]
  const isEmptySelectionWithinSymbol = selection.isEmpty && currentLocation.range.contains(selection)
  const isEqualSelection = currentLocation.range.isEqual(selection)

  if (!isEmptySelectionWithinSymbol && !isEqualSelection) {
    resetState()
    listeners.selection?.dispose()
    listeners.selection = undefined
  }
}
