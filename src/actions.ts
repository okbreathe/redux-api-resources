import resourceActionTypes from './action_types'
/**
 *
 * Generates a standard set of resource action creators corresponding to
 *
 * @param {String} resourceName  - name of the resource
 * @return {Object}
 *
 */
export default function resourceActions(resourceName: string){
  if (!resourceName) throw new Error('Expected resource name')
  const actionTypes = resourceActionTypes(resourceName)
  return Object.keys(actionTypes).reduce((acc: any, key) => {
    acc[key] = createAction(actionTypes[key])
    return acc
  }, {})
}

function createAction(type: string) {
  return (payload?: any, meta?: any) => ({ type, payload, meta, error: type.substr(-7) === "FAILURE" })
}
