import { bindActionCreators, ActionCreatorsMapObject } from 'redux'
import resourceActionTypes from './action_types'
import resourceActions from './actions'
import resourceReducer, { initialResourceState } from './reducer'
import * as helpers from './helpers'
import {
  Action,
  Resource,
  ResourceActionTypes,
  ResourceActions,
  ResourceWithHelpers,
  ResourceReducerOptions,
} from './types'

export { resourceActionTypes, resourceActions, resourceReducer, initialResourceState }
export * from './types'
export * from './helpers'

/**
 * Generate a resource in the redux store
 * const resource = createResource<MyModel>("models");
 */
export function createResource<T>(resourceName: string, options?: ResourceReducerOptions<T>) {
  return {
    types: resourceActionTypes<T>(resourceName),
    actions: resourceActions<T>(resourceName),
    reducer: resourceReducer<T>(resourceName, options),
  }
}

/**
 * Wrap a resource with helpers functions
 *
 */
export function resourceWithHelpers<T>(resource: Resource<T>): ResourceWithHelpers<T> {
  return {
    ...resource,
    forEach: (fn: (entity: T) => void) => helpers.forEach(resource, fn),
    filter: (pred: (entity: T) => any) => helpers.filter(resource, pred),
    first: (fn: (entity: T) => T | undefined) => helpers.first(resource, fn),
    get: (fn: (entity: T) => T | undefined) => helpers.get(resource, fn),
    last: (fn: (entity: T) => T | undefined) => helpers.last(resource, fn),
    map: (fn: (entity: T, index: number) => any) => helpers.map(resource, fn),
    not: (pred: (entity: T) => T | undefined) => helpers.not(resource, pred),
    reduce: (fn: (entity: T) => any, init: any) => helpers.reduce(resource, fn, init),
    sort: (fn: (a: T, b: T) => number) => helpers.sort(resource, fn),
    toArray: () => helpers.toArray(resource),
  }
}
