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

## Problems

- Unclear usage with checkbox / select
- Boilerplate of setting up resources
