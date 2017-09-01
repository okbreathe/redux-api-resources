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

This nets you a bunch of actions. There are four standard CRUD operations:
`fetch` (i.e. `read`), `create`, `update`, and `destroy`. For each action there
are four possible invocations: `start`, `success`, `failure` and `clear`.
Using the `fetch` operation as an example there exists the following actions:

```javascript
actions.fetchStart() // => Put the fetch status into a busy state
actions.fetchFailure(payload, meta) // => Put the fetch status into a failure state
actions.fetchSuccess(payload, meta) // => Put the fetch status into a success state _and_ merge the fetched data into the collection
actions.fetchClear() // => Reset the fetch status to the default state
```

For modifying resources there are two actions: `changesetAdd` and
`changesetRemove`. A changeset is the data that will eventually be sent to the server to
modify a given record. That said, generally it's more convenient to work with
the form abstraction than work with these actions directly. More on that in a bit.

Finally there is a reset action for restoring a resource to a pristine state,
to analagous deleting EVERYTHING `resourceReset()`.
