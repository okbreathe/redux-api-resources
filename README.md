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


// This goes into the actions as resourceForm
// export function resourceForm<T>(actions: ResourceActions<T>, resource: Resource<T>, key?: string){
//   return {
//     set: {}, // actions.changesetSet(changes, meta)
//     remove: {}, // actions.changesetRemove(changes, meta)
//     clear: {}, // actions.changesetRemove({}, meta)
//     field: {}, // binds form Events to actions.changeset
//   }
// }


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
}

