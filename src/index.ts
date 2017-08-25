import { bindActionCreators, ActionCreatorsMapObject } from 'redux'

import resourceActionTypes from './action_types'
import resourceActions from './actions'
import resourceReducer from './reducer'
import * as selectors from './selectors'
import { Action, Resource, ResourceActions } from './types'

export { resourceActionTypes, resourceActions, resourceReducer }
export * from './types'
export * from './selectors'

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

export function bindResource<T>(resource: Resource<T>){
  return {
    each(fn: (entity: T) => void) { return selectors.each(resource, fn) },

    filter(pred: (entity: T) => any) { return selectors.filter(resource, pred) },

    first(fn: (entity: T) => T | undefined) { return selectors.first(resource, fn) },

    find(fn: (entity: T) => T | undefined) { return selectors.find(resource, fn) },

    last(fn: (entity: T) => T | undefined) { return selectors.last(resource, fn) },

    map(fn: (entity: T, index: number) => any) { return selectors.map(resource, fn) },

    not(pred: (entity: T) => T | undefined) { return selectors.not(resource, pred) },

    reduce(fn: (entity: T) => any, init: any) { return selectors.reduce(resource, fn, init) },

    sort(fn: (a: T, b: T) => number) { return selectors.sort(resource, fn) },

    toArray(){ return selectors.toArray(resource) },
  }
}
