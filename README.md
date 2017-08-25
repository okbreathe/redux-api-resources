# Redux API Resources

An opinioned library for working with collections of resources through redux.

## Basic Usage

Depending on how you structure your Redux app, your usage may very

```typescript
// Generate action types for a "users" resource
const types = resourceActionTypes("users"),

// Generate actions for a "users" resource
const actions = resourceActions("users"),

// Generate a reducer for a "users" resource
const reducer = resourceReducer<T>("users", options?: any),

// Generate action types, actions and an reducer for a "users" resource
const { actions, types, reducer } = resourceFor("users", options?: any)
```

A resource is defined in the store as:

```typescript
export interface ReduxResource<T> {
  // Ordered object ids
  results: id[]
  // Objects keyed by id
  entities: {[key: string]: T}
  // Store meta data about the collection (e.g. pagination, sort)
  meta: {[key: string]: any}
  // Temporary writeable state, common use case editing a form
  changeset: {[key: string]: any}
  // Result of the last CRUD operation. Typically used to display information
  // to the user about the status of a given operation (e.g. updating a user failed)
  status : {
    fetch: Status
    create: Status
    update: Status
    destroy: Status
  }
}
```

### Actions

There are four REST-based action verbs: `fetch`, `create`, `update`, `destroy`

For each verb the following actions are defined to encapsulate a typical REST
lifecycle: `start`, `success` and `failure`. Additionally there is a `clear` action
that used to reset the status of an REST operation. Typically this is unnecessary
to do manually as initiating another operation will automatically update the status

```typescript
const actions = resourceActions("users")

actions.fetchStart() // => Put the resource's fetch status into a busy state
actions.fetchFailure(payload, meta) // => Put the resource's fetch status into a failure state
actions.fetchSuccess(payload, meta) // => Put the resource's fetch status into a successful state and merges the data into the collection
actions.fetchClear() // => Reset the fetch status to the default state
```

There are two actions defined for working with a resource's changeset: `changesetAdd` and `changesetRemove`.
A changeset is roughly analagous to a form. Typically the modifications to a changeset will be what
you send to the server for creating or updating an resource.

```typescript
const actions = resourceActions("users")

actions.changesetAdd(payload: {}, meta?: { form: string }) // => Add or replace key values in the changeset object
actions.changesetRemove(payload: string[] | true, meta?: { form: string }) // => Remove a list of keys from the changeset, or remove ALL keys
```

#### Form Helper

Creating and updating resources are extremely common activities, as such there's a helper method that encapsulates
updating the store with user input.

```typescript
import { bindActionCreators } from 'redux'

const actions = resourceActions("users")
const form = actions.resourceForm(uniqueKey = 'default')
```

A generated `resourceForm` has four methods:

```typescript
  // Set the given key values in the changeset
  set(changes: [key: string]: any)

  // Remove the given keys from the changeset
  remove(...fields: string[])

  // Remoe all keys from the changeset
  clear()

  // Creates an action dispatcher, detailed below
  field(name: string, args: any)
```

#### Field Action dispatcher

The field helper takes the name of a field and returns an object which binds an event to dispatch
changes to the changeset. This can then be used on an input by using the spread operator.

```typescript
<input type="string" {...field("name")} />
```

### Selectors

As resources are stored both as key/values and an ordered set of ids, working
with them isn't as straight forward as an array of objects. There are selectors
defined for performing commong operations on collections, e.g. `map`, `reduce`,
`filter` etc.

```typescript
import { map, reduce, filter } from 'redux-api-resources'

map(myResource, r => r)
```

You can also wrap a resource so that you can call the methods directly on the resource

```typescript
import { resourceWithSelectors } from 'redux-api-resources'

const wrappedResource = resourceWithSelectors(myResource)

wrappedResource.map(r => r)
```

### Reducer Options

```typescript
{
  idAttribute: "id",
  onUpdate: (prev, next) => next,
  changesetReducer: (form, changeset) => ({ ...form, ...changeset}),
  entityReducer: (action, payload, meta) => payload,
  errorReducer: (action, payload, meta) => payload,
}
```

* idAttribute - defines which key serves as the object's id, typically "id"
* onUpdate - applied when updating an existing entity in the store
* changesetReducer - applied when merging changesets
* entityReducer - applied when merging entities into the store
* errorReducer - applied when adding errors to an action's status

## Problems

- Unclear usage with checkbox / select
- Boilerplate of setting up resources

# TODO

- Use `key` instead of `form` for changeset
