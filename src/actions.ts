import resourceActionTypes from './action_types'
import { Action, ResourceActions } from './types'
import form from './form'

/**
 *
 * Generates a standard set of resource action creators corresponding to
 *
 * @param {String} resourceName  - name of the resource
 * @return {Object}
 *
 */
export default function resourceActions<T>(resourceName: string): ResourceActions<T> {
  if (!resourceName) throw new Error('Expected resource name')
  const actionTypes = resourceActionTypes(resourceName)
  const actions = Object.keys(actionTypes).reduce(
    (acc: any, key) => ({
      ...acc,
      [key]: (payload: T, meta?: any) => ({
        type: actionTypes[key],
        payload,
        meta,
        error: actionTypes[key].substr(-7) === 'FAILURE',
      }),
    }),
    {}
  )

  actions.resourceForm = form(resourceName, actions)

  return actions
}
