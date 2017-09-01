# Redux API Resources

An opinioned library for Redux focused on resource management and reduction of boilerplate.

* Generates a common set of action types and action creators based on standard CRUD operations
* Stateful information about each CRUD operation, e.g. whether a resource is busy, operation resulted in an error etc.
* Concise abstraction for modifying resources (read: form). All state is stored in Redux

## Setup

```javascript
// Generate action types, action creators and a reducer for a "users" resource
const { actions, types, reducer } = resourceFor("users", { ...options })

// Or à la carte
const types = resourceActionTypes("users"),

const actions = resourceActions("users"),

const reducer = resourceReducer("users", { ...options }),
```

Having created a resource you can use it in your components:


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

There are four standard CRUD operations: `fetch` (i.e. `read`), `create`,
`update`, and `destroy`. For each action there are four possible invocations:
`start`, `success`, `failure` and `clear`. Using the `fetch` operation as an
example there exists the following actions:

```javascript
actions.fetchStart() // => Put the fetch status into a busy state
actions.fetchFailure(payload, meta) // => Put the fetch status into a failure state and merge the response into the status
actions.fetchSuccess(payload, meta) // => Put the fetch status into a success state and merge the fetched data into the collection
actions.fetchClear() // => Reset the fetch status to the default state
```

Typical usage would look something like this:

```java

function fetchUsers() {
  actions.fetchStart()
  try {
    const users = api.fetchUsers()
    actions.fetchSuccess(users)
  } catch (e) {
    actions.fetchFailure(e.message)
  }
}
```

In addition to standard CRUD-based actions, there are two actions for working with transient data for
modifying a resource: `changesetSet` and `changesetRemove`.

```javascript
actions.changesetSet({ key: value }, { form: key }) // => Add or replace the key in the changeset with the given value
actions.changesetRemove([key, key...], { form: key }) // => Remove the following keys from the changeset
actions.changesetRemove(true, { form: key }) // => Remove ALL the cahnges from the changeset
```

The second argument is optional. It is used to specify a unique key in the changeset object for the given data.
If omitted all changes will be placed under a `default` key. For example:

```javascript
actions.changesetSet({ foo: 'bar' }, { form: 'myKey' })
actions.changesetSet({ bar: 'baz' }, { form: 'otherKey' })
actions.changesetSet({ baz: 'quux' })
```

Will result in a changeset object that looks like this:

```javascript
{ myKey: { foo: 'bar' }, otherKey: { bar: 'baz' }, default: { baz: 'quux' } }
```

Generally it's more convenient to work with the form abstraction than work with
these actions directly. More on that next.

Finally there is a reset action for restoring a resource to a pristine state,
to analagous deleting EVERYTHING `resourceReset()`.

### Working with Resources

A resource is defined in the store as:

```javascript
export interface ReduxResource<T> {
  // Ordered object ids
  results: []
  // Objects keyed by id
  entities: {}
  // Store meta data about the collection (e.g. pagination, sort)
  meta: {}
  // Temporary writeable state, common use case editing a form
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

#### Collection Helpers

As resources are stored both as key/values and an ordered set of ids, working
with them isn't as straight forward as a simple array of objects. There are a number of
functions defined for performing commong operations on collections, e.g. `map`, `reduce`,
`filter` etc.

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

Modifying resources is an extremely common activity, as such there's a helper method that encapsulates
updating the store in reaction to user input.

```javascript
const form = actions.resourceForm(uniqueFormKey = 'default')
```

A generated `resourceForm` has six methods:

```javascript
  // Set the given key values in the changeset
  set({ key: value })

  // Retrieve the current changeset. Optionally limit the changes to one or more keys to retrieve
  changeset(...keys)

  // Retrieve the errors for a given CRUD operation, where which is one of 'create', 'update', 'fetch', or 'destroy'
  errors(which)

  // Remove the given keys from the changeset
  remove(...fields)

  // Remove everything from the changeset
  clear()

  // Creates an action dispatcher, detailed below
  field(name, { /*options*/ })
```

#### Field Action Dispatcher

The field function takes the name of a field and returns an object which binds
an event to dispatch changes to the changeset. This can then be used on an
input by using the spread operator.

```javascript
<input type="string" {...field("name")} />
```
The following options can also be specified:

```javascript
{
  storeKey = null,
  valueKey = 'value',
  eventType = 'onChange',
  defaultValue = "",
  afterEvent = (value, fieldData) => undefined,
  normalize = (value, fieldData) => value,
  format = (value, name) => value,
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

### Reducer

When creating a reducer either through `resourceReducer` or `resourceFor`, there are a number
of options for customizing how data is updated in the store:

```javascript
{
  idAttribute: "id",
  onUpdate: (prev, next) => next,
  changesetReducer: ({ /*changeset*/ }, { /*changes*/ }) => ({ ...changeset, ...changes}),
  entityReducer: (action, { /*payload*/ }, { /*meta*/ }) => payload,
  errorReducer: (action, { /*payload*/ }, { /*meta*/ }) => payload,
}
```
* idAttribute - defines which key serves as the object's id, typically "id"
* onUpdate - applied when updating an existing entity in the store
* changesetReducer - applied when merging changesets
* entityReducer - applied when merging entities into the store
* errorReducer - applied when adding errors to an action's status
