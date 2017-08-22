const TYPES = [
  'fetch',
  'create',
  'update',
  'destroy'
]

const STATES = [
  'start',
  'success',
  'failure'
]

export default function resourceActionsTypes(resourceName: string){
  return TYPES.reduce((acc: any, type) => {
    STATES.forEach(state => acc[`${type}${state[0].toUpperCase()}${state.slice(1)}`] = `${resourceName}/${type}/${state}`)
    return acc
  }, {})
}
