import { bindActionCreators, ActionCreatorsMapObject } from 'redux'

import resourceActionTypes from './action_types'
import resourceActions from './actions'
import resourceReducer from './reducer'
import * as selectors from './selectors'
import { Action, Resource, ResourceActions } from './types'

export { resourceActionTypes, resourceActions, resourceReducer }
export * from './types'
export * from './selectors'

const actions = ['fetch','create','update','destroy']

/**
 * Generate a resource in the redux store
 * const resource = createResource<MyModel>("models");
 */
export function createResource<T>(resourceName: string){
  return {
    types:   resourceActionTypes(resourceName),
    actions: resourceActions(resourceName),
    reducer: resourceReducer<T>(resourceName),
  }
}

// There's a couple different things here
//
// createResource isn't a resource, so we wouldn't have access to the actions yet

// const ordersResource= resource(dispatch, state.orders)

// Basically this is supposed to wrap the resource so you don't have to import a bunch
// of shit
//
// So currently we export all of the created resource

// We need
// 1) The state, resource = state
// 2) The actions = from createResource
export function bindResource<T>(dispatch: ActionCreatorsMapObject, res: Resource<T>, actions: ResourceActions<T>){
  return {
    each(fn: (entity: T) => void) { return selectors.each(res, fn) },

    filter(pred: (entity: T) => any) { return selectors.filter(res, pred) },

    first(fn: (entity: T) => T | undefined) { return selectors.first(res, fn) },

    find(fn: (entity: T) => T | undefined) { return selectors.find(res, fn) },

    last(fn: (entity: T) => T | undefined) { return selectors.last(res, fn) },

    map(fn: (entity: T, index: number) => any) { return selectors.map(res, fn) },

    not(pred: (entity: T) => T | undefined) { return selectors.not(res, pred) },

    reduce(fn: (entity: T) => any, init: any) { return selectors.reduce(res, fn, init) },

    sort(fn: (a: T, b: T) => number) { return selectors.sort(res, fn) },

    toArray(){ return selectors.toArray(res) },

    actions: bindActionCreators(dispatch, (actions as any)),

    form: {
    }

    // 1) We want to create an actionCreator/actionProducer that automatically hooks up events to state changes
    // 2) We want to be able to get/set/clear the value of the form
    // The only thing we need is dispatch
    //
    // Previously the form was considered an action which didn't make sense because it creates a producer
  }
}

    // #<{(|
    //  * Copy the payload into an editable form object
    //  |)}>#
    // init(payload: any) {
    // },
    // #<{(|
    //  * Clear given fields or entire form
    //  |)}>#
    // clear(...fields: any[]) {
    // },
    // #<{(|
    //  * Change given fields
    //  *
    //  * Expects keys to be field names and values to be field values
    //  |)}>#
    // change(fields = {}) {
    // },
    // #<{(|
    //  * Return the current form errors
    //  |)}>#
    // errors(action: string = "", fieldKey?: string) {
    //   action = action.toLowerCase()
    //   if (actions.indexOf(action) == -1) {
    //     console.warn(`Invalid action type ${action}. Must be one of ${actions.join(', ')}`)
    //     return {}
    //   }
    //   const status = res.status
    //   const errors = !status[action].success && status[action].payload || {}
    //
    //   return fieldKey
    //     ? errors[fieldKey]
    //     : errors
    // },
    // #<{(|
    //  * Return the current state of the form.
    //  *
    //  * Returns all fields by default but can be limited to selected
    //  * fields by passing the field names in as arguments
    //  |)}>#
    // state(...fields: string[]) {
    // },
    // #<{(|*
    //  * Generates a field that dispatches change actions
    //  *
    //  * Use the field generator on a component
    //  * <input {...field("name", { options })} />
    //  |)}>#
    // field(name: string, ...args: any[]) {
    // }
