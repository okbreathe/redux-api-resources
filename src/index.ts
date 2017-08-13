import { bindActionCreators, ActionCreatorsMapObject } from 'redux'

import resourceActionTypes from './action_types'
import resourceActions from './actions'
import resourceReducer, { initialResourceState } from './reducer'
import * as helpers from './helpers'
import { Action, Resource, ResourceActions, ResourceWithHelpers  } from './types'

export { resourceActionTypes, resourceActions, resourceReducer, initialResourceState }
export * from './types'
export * from './helpers'

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

/**
 * Wrap a resource with helpers functions
 *
 */
export function resourceWithHelpers<T>(resource: Resource<T>): ResourceWithHelpers<T>{
  return {
    ...resource,

    forEach(fn: (entity: T) => void) { return helpers.forEach(resource, fn) },

    filter(pred: (entity: T) => any) { return helpers.filter(resource, pred) },

    first(fn: (entity: T) => T | undefined) { return helpers.first(resource, fn) },

    get(fn: (entity: T) => T | undefined) { return helpers.get(resource, fn) },

    last(fn: (entity: T) => T | undefined) { return helpers.last(resource, fn) },

    map(fn: (entity: T, index: number) => any) { return helpers.map(resource, fn) },

    not(pred: (entity: T) => T | undefined) { return helpers.not(resource, pred) },

    reduce(fn: (entity: T) => any, init: any) { return helpers.reduce(resource, fn, init) },

    sort(fn: (a: T, b: T) => number) { return helpers.sort(resource, fn) },

    toArray(){ return helpers.toArray(resource) },
  }
}
