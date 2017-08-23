# Redux API Resources

fetchStart(meta)
fetchSuccess(api.response, meta)
fetchFailure(api.response, meta)

An opinioned library for working with collections of resources through redux.

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
  // Temporary writeable state, analogous to a form
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
