import { computed, defineExtension, useCommand, useDisposable, useEvent, useStatusBarItem } from 'reactive-vscode'
import { StatusBarAlignment, commands as vscodeCommands, window } from 'vscode'
import { findReferences } from './find-references'
import { commands, name } from './generated/meta'
import { checkForSelectionChange, listeners } from './listener'
import { decrementLocationIndex, derivedState, incrementLocationIndex, state } from './state'
import { logger } from './utils'

const { activate, deactivate } = defineExtension(() => {
  logger.show()

  useDisposable({
    dispose: () => listeners.selection?.dispose(),
  })

  useCommand(
    commands.findReferences,
    async () => {
      await vscodeCommands.executeCommand('editor.action.revealDefinition')
      await findReferences()
    },
  )

  useCommand(
    commands.nextSymbol,
    async () => {
      if (!state.locations.length) {
        await findReferences()
      }
      const nextLocation = incrementLocationIndex()
      if (nextLocation) {
        window.showTextDocument(nextLocation.uri, { selection: nextLocation.range })
        if (!listeners.selection) {
          listeners.selection = window.onDidChangeTextEditorSelection(checkForSelectionChange)
        }
      }
    },
  )

  useCommand(
    commands.previousSymbol,
    async () => {
      if (!state.locations.length) {
        await findReferences()
      }
      const previousLocation = decrementLocationIndex()
      if (previousLocation) {
        window.showTextDocument(previousLocation.uri, { selection: previousLocation.range })
      }
    },
  )

  useStatusBarItem({
    alignment: StatusBarAlignment.Left,
    priority: 1000,
    id: name,
    text: derivedState.statusText,
    tooltip: derivedState.statusTooltip,
  }).show()
})

export { activate, deactivate }
