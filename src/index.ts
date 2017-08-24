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

// The problem is we're using both high and low level components without a clear distinction

// We're just trying to bind the action creators ...
// The only question is where the form shit goes
// 1) We can just add it to the actions
export function bindResource<T>(dispatch: ActionCreatorsMapObject, actions: ResourceActions<T>){
  return bindActionCreators(dispatch, (actions as any))
}

// The form is at a higher level than the actions. This is probably the correct way to do it
// The issue is just having to pass all these arguments in
// Do we need to know about the state? Could this be separated further
export function resourceForm<T>(actions: ResourceActions<T>, resource: Resource<T>, key?: string){
  // I think that changeset actions are so confusing that means the API is bad,
  // I do think we should just have higher level action creators that take advantage of it
  return {
    state: {}, // Can be retrieved from resource.changeset
    set: {}, // actions.changesetSet(changes, meta)
    remove: {}, // actions.changesetRemove(changes, meta)
    clear: {}, // actions.changesetRemove({}, meta)
    field: {}, // binds form Events to actions.changeset
  }
}

// I guess there's two things we're doing
// set / remove / clear - just convenience wrappers around CHANGESET/SET nad CHANGESET/REMOVE
// The difference is we just bind the meta { form }
//
// state = resource.changeset
//
// field listens to state and dispatches actions
//
// This needs to know about state and actions
// const field = fieldSet(formKey)
