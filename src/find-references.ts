import type { Location } from 'vscode'
import { executeCommand, useActiveTextEditor } from 'reactive-vscode'
import { regexes } from './regexes'
import { resetState, state } from './state'
import { logger } from './utils'

export async function findReferences() {
  const referenceResults = await findSymbolLocations()

  if (!referenceResults || referenceResults.validLocations.length === 0) {
    logger.info(!referenceResults ? 'No symbol references found' : 'No non-excluded symbol reference locations found')
    resetState()
    return
  }

  if (state.symbolText !== referenceResults.symbolText) {
    state.symbolText = referenceResults.symbolText
    state.currentLocationIndex = 0
  }

  state.locations = referenceResults.validLocations
  state.excluded = referenceResults.allLocations.length - referenceResults.validLocations.length

  logger.info(`Found ${referenceResults.validLocations.length} non-excluded symbol reference locations out of ${referenceResults.allLocations.length} total`)
}

async function findSymbolLocations() {
  const editor = useActiveTextEditor()
  if (!editor.value)
    return

  const position = editor.value.selection.active

  const allLocations = await executeCommand(
    'vscode.executeReferenceProvider',
    editor.value.document.uri,
    position,
  ) as Location[]

  const cursorLocation = allLocations.find(
    location =>
      location.uri.fsPath === editor.value?.document.uri.fsPath
      && location.range.start.line === position.line
      && location.range.start.isBeforeOrEqual(position)
      && location.range.end.isAfterOrEqual(position),
  )

  if (!cursorLocation)
    return

  const symbolText = editor.value.document.getText(cursorLocation.range)

  const validLocations = allLocations.filter((location) => {
    const fileName = location.uri.fsPath
    return !regexes.value.some(regex => regex.test(fileName))
  })

  return {
    allLocations,
    validLocations,
    cursorLocation,
    symbolText,
  }
}
