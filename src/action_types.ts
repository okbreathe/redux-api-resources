import { ResourceActionTypes } from './types'

const RESOURCE_TYPES = [
  'fetch',
  'create',
  'update',
  'destroy'
]

const RESOURCE_STATES = [
  'start',
  'success',
  'failure',
  'reset'
]

const CHANGESET_TYPES = [
  'merge',
  'remove',
  'reset',
]

/**
 *
 * Generates an object containing actions in the format: RESOURCE_NAME/DOMAIN/METHOD
 * - action types corresponding to standard REST-based actions
 * - action types for modifying resource changesets
 * - action types for modifying resource meta
 */
export default function resourceActionsTypes<T>(resourceName: string): ResourceActionTypes<T> {
  if (!resourceName) throw new Error('Expected resource name')

  return {
    ...generateActionTypes(resourceName, RESOURCE_TYPES, RESOURCE_STATES),
    ...generateActionTypes(resourceName, ['changeset'], CHANGESET_TYPES),
    ...generateActionTypes(resourceName, ['resource'], ['reset']),
    ...generateActionTypes(resourceName, ['meta'], ['reset']),
  }
}

function generateActionTypes(resourceName: string, types: string[], states: string[]){
  return types.reduce((acc: any, type) => {
    states.forEach(state => {
      acc[`${type}${state[0].toUpperCase()}${state.slice(1)}`] = `${resourceName}/${type}/${state}`.toUpperCase()
    })
    return acc
  }, {})
}
