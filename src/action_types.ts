const RESOURCE_TYPES = [
  'fetch',
  'create',
  'update',
  'destroy'
]

const RESOURCE_STATES = [
  'start',
  'success',
  'failure'
]

const CHANGESET_TYPES = [
  'create',
  'update',
  'destroy'
]

const STATUS_TYPES = [
  'clear'
]

/**
 *
 * Generates an object containing actions in the format: RESOURCE_NAME/DOMAIN/METHOD
 * - action types corresponding to standard REST-based actions
 * - action types for modifying resources
 * - action types for clearing the status of a resource
 */
export default function resourceActionsTypes(resourceName: string, additionalTypes: string[] = []){
  if (!resourceName) throw new Error('Expected resource name')

  return {
    ...generateActionTypes(resourceName, additionalTypes.concat(RESOURCE_TYPES), RESOURCE_STATES),
    ...generateActionTypes(resourceName, ['changeset'], CHANGESET_TYPES),
    ...generateActionTypes(resourceName, ['status'], STATUS_TYPES)
  }
}

function generateActionTypes(resourceName: string, types: string[], states: string[]){
  return types.reduce((acc: any, type) => {
    states.forEach(state => acc[`${type}${state[0].toUpperCase()}${state.slice(1)}`] = `${resourceName}/${type}/${state}`.toUpperCase())
    return acc
  }, {})
}
