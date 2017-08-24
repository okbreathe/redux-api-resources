# Redux API Resources

fetchStart()
fetchSuccess(api.response, meta)
fetchFailure(api.response, meta)
fetchClear()

An opinioned library for working with collections of resources through redux.

Tests for mutating resource

CRUD

Things which initiate CRUD, and the results of that

A resource is defined in the store as follows

```
export interface ReduxResource<T> {
  results: id[]
  // id: <Entityt>
  entities: {[key: string]: T}
  // Store meta data about the collection (e.g. pagination, sort)
  meta: {[key: string]: any}
  // Temporary writeable state, common use case editing a form
  changeset: {[key: string]: any}
  // Result of the last crud operation
  status : {
    fetch: Status
    create: Status
    update: Status
    destroy: Status
  }
}
```

Entities in the store are immutable. They can only be altered by dispatching one of fetch/create/update/destroy

To work with entities in the modifiable state you

"Pluck things from the heap"

Because you can setup a redux application in a variety of ways there are multiple helpers for working with a resource

resourceTypes - Genereate a standard set of action types

resourceActions - Generate a standard set of actions

resourceReducer - Generate a reducer for set of actions

resourceFor - Generate types, actions and a reducer

createReduxResource => alias for resourceFor
users: reduxResource(state.resource) => convience wrapper

users.map
users.find
users.find

## Problems

- resourceForm is stored separately from the resource in redux
- Not able to edit multiple resources (you can)
- Unclear usage with checkbox / select
- Boilerplate of setting up resources
- Need some way of generating actions outside of CRUD. The reason for this being that working with sagas, you don't necessarily want to call a resource's start method because then you can't control the rest of
  ancillaryActions: {
  }
  it since the api will be called etc

import * as React from 'react'

class Component extends React.Component {
  render(){
    return ...
  }
}

..connect


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
