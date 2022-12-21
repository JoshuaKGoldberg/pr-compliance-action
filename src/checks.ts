import conventionalConfig from 'conventional-changelog-conventionalcommits'
import * as conventionalTypes from 'conventional-commit-types'
import {sync} from 'conventional-commits-parser'

type LintRuleOutcome = {
  message: string
  valid: boolean
}
type BodyCheckOutcome = {
  valid: boolean
  groups?: RegExpExecArray['groups']
}

function checkBody(body: string, regexString: string): BodyCheckOutcome {
  const regex = new RegExp(regexString, 'mi')
  const bodyNoComments = body.replace(/<!--(.*?)-->/gms, '')
  const match = bodyNoComments.match(regex)
  if (match) {
    const valid = true
    if (match.groups) {
      return {
        valid: true,
        groups: match.groups
      }
    }
    return {valid}
  }
  return {valid: false}
}

function checkBranch(branch: string, protectedBranch: string): boolean {
  return branch !== protectedBranch
}

async function checkTitle(
  title: string
): Promise<{valid: boolean; errors: LintRuleOutcome[]}> {
  const {parserOpts} = await conventionalConfig()
  const defaultTypes = Object.keys(conventionalTypes.types)
  try {
    const result = sync(title, parserOpts)
    const errors: LintRuleOutcome[] = []
    if (!defaultTypes.includes(result.type))
      errors.push({
        valid: false,
        message: `Found type "${
          result.type
        }", must be one of "${defaultTypes.join('","')}"`
      })
    if (!result.subject)
      errors.push({valid: false, message: 'No subject found'})
    return {valid: errors.length === 0, errors}
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          valid: false,
          message: error instanceof Error ? error.message : 'Unknown Error'
        }
      ]
    }
  }
}

export {checkBody, checkBranch, checkTitle}
