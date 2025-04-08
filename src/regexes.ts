import { computed } from 'reactive-vscode'
import { window } from 'vscode'
import { config } from './config'
import { logger } from './utils'

export const regexes = computed(() => {
  const regexpObjects = []
  const errors: string[] = []
  for (const pattern of config.excludePatterns) {
    try {
      regexpObjects.push(new RegExp(pattern))
    }
    catch (error) {
      errors.push(pattern)
      logger.error(`Error parsing exclude pattern: ${pattern}. Error: ${error}`)
    }
  }
  if (errors.length > 0) {
    window.showErrorMessage(`Error parsing exclude ${pluralize('pattern', errors.length)}: ${errors.join(', ')}`)
  }
  return regexpObjects
})

function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`
}
