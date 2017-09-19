# Redux API Resources

A type-safe, opinionated library for Redux focused on resource management and reduction of boilerplate.

* Generates a common set of action types and action creators based on standard CRUD operations
* Stateful information about each CRUD operation, e.g. whether a resource is busy, operation resulted in an error etc.
* Concise abstraction for modifying resources (read: form). All state is stored in Redux

## Setup

**Generate action types, action creators and a reducer for a "users" resource**

```javascript
const { actions, types, reducer } = createResource("users", { ...reducerOptions })
```
**Or à la carte**

```javascript
const types = resourceActionTypes("users"),
const actions = resourceActions("users"),
const reducer = resourceReducer("users", { ...reducerOptions }),
```

**Add the resource reducer to your root reducer**


```javascript
import { combineReducers } from 'redux'
import users from '<somewhere>'

const rootReducer = combineReducers({
  users: users.reducer,
  // ... more reducers
})
```

**After you've created a resource and hooked it into your store you can use it in your components**


```javascript
import { bindActionCreators } from 'redux'

import users from '<somewhere>'

connect(
  (state, props) => ({ /* ...your bits and bobs... */ }),
  (dispatch) => ({
    actions: bindActionCreators(users.actions, dispatch),
  })
)(SomeComponent)
```

## Actions

Actions are based on the [Redux Standard Action](https://github.com/acdlite/flux-standard-action).
Every action takes at most _two_ arguments, a `payload` object and a `meta`
object. Depending on the action, it may or may make use of these arguments.

There are four standard CRUD operations: `fetch` (aka read), `create`,
`update`, and `destroy`. For each action there are four possible invocations:
`start`, `success`, `failure` and `reset`. Each operation stores the state and
result of the last operation in a status object. Using the `fetch` operation as an
example there exists the following actions:

```javascript
// Put the fetch status into a busy state
actions.fetchStart()

// Put the fetch status into a success state
// Merge the meta data into the existing meta
// Payload is assumed to be one or more resource bojects and will be merged into the collection
actions.fetchSuccess(payload, meta)

// Put the fetch status into a failure state
// Merge the meta data into the existing meta
// Payload is assumed to be status information (e.g. error) data and will be available on fetch status object
actions.fetchFailure(payload, meta)

// Reset the fetch status to the default state
actions.fetchReset()
```
Typical usage would look something like this:

```javascript
function fetchUsers() {
  actions.fetchStart()
  try {
    const users = api.fetchUsers()
    // Add users to the collection, set the meta info to `page: 1`
    actions.fetchSuccess(users, { page: 1 })
  } catch (e) {
    actions.fetchFailure(e.message)
  }
}
```

In addition to standard CRUD-based actions, there are two actions for working
with transient data typically used for modifying a resource: `changesetMerge` and
`changesetRemove`.

```javascript
// Add or replace the key/value pairs in the changeset
actions.changesetMerge({ key: value }, { form: 'key' })

// Remove the following keys from the changeset
actions.changesetRemove([key, key...], { form: 'key' })

// Reset/empty the changeset
actions.changesetReset(null, { form: 'key' })
```

Here the `meta` argument is optionally used to specify a unique key in the
changeset object for the given data. If omitted all changes will be placed
under a `default` key.

```javascript
actions.changesetMerge({ foo: 'bar' }, { form: 'myKey' })
actions.changesetMerge({ bar: 'baz' }, { form: 'otherKey' })
actions.changesetMerge({ baz: 'quux' })
```

Will result in a changeset object that looks like this:

```javascript
{ myKey: { foo: 'bar' }, otherKey: { bar: 'baz' }, default: { baz: 'quux' } }
```

Generally it's more convenient to work with the form abstraction than work with
these actions directly. More on that in a bit.

Finally, similar to resetting a CRUD operation's status, or resetting the changeset, there
is an action for resetting a resource's meta `metaReset()` and an action for
resetting the entire resource to a pristine state, to analogous deleting
EVERYTHING, `resourceReset()`.

## Working with Resources

A resource is defined in the store as:

```javascript
export interface ReduxResource<T> {
  // Ordered object ids
  results: []
  // Objects keyed by id
  entities: {}
  // Store meta data about the collection (e.g. pagination, sort)
  meta: {}
  // Temporary writeable state, common use case is storing form data
  changeset: {}
  // Result of the last CRUD operation. Typically used to display information
  // to the user about the status of a given operation (e.g. updating a user failed)
  status : {
    fetch: { pending: null, success: null, payload, busy: false },
    create: { pending: null, success: null, payload, busy: false },
    update: { pending: null, success: null, payload, busy: false },
    destroy: { pending: null, success: null, payload, busy: false }
  }
}
```

### Collection Helpers

As resources are stored both as key/values and an ordered set of ids, working
with them isn't as straight forward as a simple array of objects. There are a number of
functions defined for performing common operations on collections, e.g. `map`, `reduce`,
`filter` etc (see `src/helpers.ts`).

```javascript
import { map, reduce, filter } from 'redux-api-resources'

map(myResource, r => r)
```

You can also wrap a resource so that you can call the methods directly on the resource itself

```javascript
import { resourceWithHelpers } from 'redux-api-resources'

const wrappedResource = resourceWithHelpers(myResource)

wrappedResource.map(r => r)
```

### resourceForm

Modifying resources is an extremely common activity. `resourceForm`
encapsulates modifying and reading the state in response to user input.


```javascript
const form = actions.resourceForm(formKey = 'default')
```

When using the resourceForm helper the supplied formKey here works the same as
the formKey mentioned above. All function calls implicitly use this to scope
modification to an object under that key.

A generated `resourceForm` has six methods:

```javascript
  // Add or replace the given key/value pairs to the scoped changeset
  merge({ key: value })

  // Remove the given keys from the scoped changeset
  remove(...fields)

  // Remove everything from the scoped changeset
  clear()

  // Retrieve the current scoped changeset. If called with one or more keys,
  // it will only return that subset of key/values
  changeset(...keys)

  // Retrieve the errors for a given CRUD operation, which will be one of
  // 'create', 'update', 'fetch', or 'destroy'
  errors(which)

  // Creates an action dispatcher, detailed below
  field(name, { /* ...options */ })
```

#### Field Action Dispatcher

The field function takes the name of a field and returns an object which binds
an event to dispatch changes to the changeset. This can then be used on an
input by using the spread operator.

```javascript
<input type="string" {...field("name")} />
```
The available options are:

```javascript
{
  disabled = false,
  storeKey = null,
  valueKey = 'value',
  eventType = 'onChange',
  defaultValue = "",
  afterEvent = (value, fieldData) => undefined,
  normalize = (value, fieldData) => value,
  format = (value, name) => value,
  eventHandler = (...args: any[]) => {
    const event = args[0]
    return event && event.target ? event.target.value : event
  }
}
```
* `disabled` - Disable this field. Store will not be updated
* `storeKey` - By default the name of this field will be used as the key in the changeset. Specifying a storeKey will use that key instead
* `valueKey` - Which property will be set when the field changes
* `eventType` - The events we're listening to. Can be a string or an array of strings
* `defaultValue` - The value used if no value currently exists in the changeset
* `afterEvent` - Callback fired immediately after and event is triggered, but before the store is updated
* `normalize` - Normalize input for the Redux store. Common use case is maintaining data as one type in your store, and another for presentation
* `format` - Transforms the value in the Redux store for presentation. Used in conjunction with normalize to maintain the correct state and view types
* `eventHandler` - Handles all events specified by `eventType`. Should return the value for the store.
  To maximize compatibility with arbitrary widgets the event handler passes all arguments to the handler

### Reducer

When creating a reducer either through `resourceReducer` or `createResource`, there are a number
of options to customize how data is stored in Redux. Typically these are used to transform
a server response into a more desired shape.

```javascript
{
  idAttribute: "id",
  onUpdate: (prevResource, nextResource) => nextResource,
  changesetReducer: (changeset ,  changes) => ({ ...changeset, ...changes}),
  entityReducer: (action_type, payload, meta) => payload,
  errorReducer: (action_type, payload, meta) => payload,
}
```
* `idAttribute` - defines which key serves as the object's id, typically "id"
* `onUpdate` - applied when updating an existing entity in the store.
* `changesetReducer` - applied when merging changesets
* `entityReducer` - applied when merging entities into the store
* `errorReducer` - applied when adding errors to an action's status
