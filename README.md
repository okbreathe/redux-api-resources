# Redux API Resources

An opinioned library for working with collections of resources through redux.

## Basic Usage

Depending on how you structure your Redux app, your usage may very

```typescript
// Generate action types for a "users" resource
const types = resourceActionTypes(name: string),

// Generate actions for a "users" resource
const actions = resourceActions(name: string),

// Generate a reducer for a "users" resource
const reducer = resourceReducer<T>(name: string, options?: any),

// Generate action types, actions and an reducer for a "users" resource
const { actions, types, reducer } = resourceFor(name: string, options?: any)
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
updating the store in reaction to user input.

```typescript
import { bindActionCreators } from 'redux'

const actions = resourceActions("users")
const form = actions.resourceForm(uniqueFormKey = 'default')
```

A generated `resourceForm` has four methods:

```typescript
  // Set the given key values in the changeset
  set(changes: { [key: string]: any })

  // Remove the given keys from the changeset
  remove(...fields: string[])

  // Remove everything from the changeset
  clear()

  // Creates an action dispatcher, detailed below
  field(name: string, options: {})
```

#### Field Action dispatcher

The field helper takes the name of a field and returns an object which binds an event to dispatch
changes to the changeset. This can then be used on an input by using the spread operator.

```typescript
<input type="string" {...field("name")} />
```
The following options can also be specified:

```typescript
{
  storeKey = null,
  valueKey = 'value',
  eventType = 'onChange',
  defaultValue = "",
  afterEvent = (value: any, fieldData: any) => undefined,
  normalize = (value: any, fieldData: any) => value,
  format = (value: any, name: string) => value,
  eventHandler = (e: any, a: any, b: any, c: any) => e && e.target ? e.target.value : e
}
```
* storeKey - By default the name of this field will be used as the key in the changeset. You can use a different key in the store by specifying a storeKey
* valueKey - Which property that will be set when the field changes
* eventType - The events we're listening to. Can be a string or an array of strings
* defaultValue - The value used if no value currently exists in the changeset
* afterEvent - Callback fired immediately after and event is triggered, but before the store is updated
* normalize - Normalize input for the Redux store. Common use cases are maintaining data as Numbers or Dates in the store, while displaying them differently
* format - Formats the value in the Redux store to be used in your input component. Used in conjunction with normalize to maintain the correct state and view types
* eventHandler - Handles all events specified by `eventType` Should return the value for the store

### Collection Helpers

As resources are stored both as key/values and an ordered set of ids, working
with them isn't as straight forward as a simple array of objects. There are a number of
functions defined for performing commong operations on collections, e.g. `map`, `reduce`,
`filter` etc.

```typescript
import { map, reduce, filter } from 'redux-api-resources'

map(myResource, r => r)
```

You can also wrap a resource so that you can call the methods directly on the resource itself

```typescript
import { resourceWithHelpers } from 'redux-api-resources'

const wrappedResource = resourceWithHelpers(myResource)

wrappedResource.map(r => r)
```

### Reducer Options

When creating a reducer either through `resourceReducer<T>` or `resourceFor`, there are a number
of options for customizing how data is updated in the store:

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
