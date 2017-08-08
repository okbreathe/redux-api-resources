# redux-api-resources

Redux API Resources is a collection of reducers and action creators to mitigate the boilerplate for performing CRUD operations on remote APIs. All state is kept in the redux store.

`yarn add redux-api-resources`

or

`npm i redux-api-resources`


## Example Usage

Define your actions:

```javascript
// in ./actions/resources.js
import { apiActions } from 'redux-api-resources'

export default apiActions(resource => {
  resource("todos")
})
```

Define your resources:

```javascript
// in ./reducers/resources.js
import { apiReducer } from 'redux-api-resources'

export default apiReducer(resource => {
  // Adds a 'todos' and 'todosForm' key to the store
  resource("todos")
})
```

Dispatch actions and your store is automatically updated:

```javascript
// in ./app.js
import React from "react"
import { bindActionCreators } from "redux"
import { connect }  from 'react-redux'
import actions from './actions/resources'
import { toArray } from 'redux-api-resources'

class App extends React.Component {
  // Initiate request to '/todos', automatically populates the store
  componentDidMount = () => this.props.actions.index()

  render = () =>
    <div id='todos'>
      {this.props.todos.map(todo => <div key={todo.id}>{todo.title}</div>)}
    </div>
}

const ConnectedApp = connect(
  // Transform the resource in the store into a normal array - see Eratta at
  // the end of the readme for why this is necessary
  state => ({ todos: toArray(state.todos) }),
  // Bind API actions
  dispatch => ({ actions: bindActionCreators(actions.todos, dispatch) })
)(App)
```

See the examples folder for a full working example.

## Routing with Action Creators

By default redux-api-resources generates actions that correspond to typical REST routes.

```javascript
const resourceActions = apiActions(resource => {
  resource("users")
  // Or continue adding additional resources:
  // resource("projects")
  // resource("todos")
  // etc.
})
```

Generates the following request actions:

```javascript
// GET /users/
resourceActions.users.index(params)

// GET /users/:id
resourceActions.users.show(params)

// POST /users/
resourceActions.users.create(data, params)

// PUT /users/:id
resourceActions.users.update(data, params)

// DELETE /users/:id
resourceActions.users.destroy(params)
```

Calling an action fires off a request to the given endpoint and updates the store with the resulting data.

* `data` - the data you're sending to the server (i.e. form data),
* `params` -  any parameters necessary to build an URL from the route. These will be substituted into the route for any parameter prefixed with `:`

Note that in the case of `create` and `update` if the data contains the required params to build the route (e.g. `{ id: 1, name: "user" }`) it is unnecessary to supply any params.

### Configuration

You can pass a configuration object as a second argument to the apiActions function to configure the defaults for every resource

```javascript
apiActions(resource => {
  resource("users")
}, { ...configuration })
```

Configuration Options:

Option | Type | Default | Description
------ | ---- | ------- | -----------
prefix | string | "" | Will be prepended to the generated route (e.g "/api" + "/users/:id")
domain | string | "" | Set the domain if it is not the current domain
options | function \| object | {} | Fetch options. If given a function, it will be called with `getState` as an argument and it should return an object
meta | object \| function | {} | Add meta information to this action. Can be an object or a function that returns an object
middleware | array | [] | Array of middleware functions to apply to each request

### Fetch Options

Example usage:

```javascript
import { Headers } from 'redux-api-resources'
apiActions(resource => {
  resource("users")
}, {
  options: (getState) => ({
    headers:  { ...Headers.JSON, 'Authorization' : getState().auth.token }
  })
})
```

### Middleware

Middleware are functions that run on every request. Here is a simple logging middleware:

```javascript
const LoggingMiddleware = (resourceName, req) => {
  console.log('request', req)
  req.resolve()
}
```

Each middleware is called with the name of the resource it corresponds to as well as a request object. A middleware must either `resolve` the request in order to continue the chain or `reject` the request to halt the chain. A request object contains of the following keys:

```javascript
{ resolve, reject, setFetched, fetch, options, dispatch, action }
```

* `resolve` - Apply the next middleware
* `reject` - Fail the require
* `setFetched` - Sets whether or not this request has been fetched/handled. If true the fetch request will run when the middleware chain is finished, if false it will not run
* `fetch` - Perform the fetch request. If your middleware needs access to the request, you can manually perform the request
* `options` - Options associated with the current request,
* `dispatch` - redux dispatch function for dispatching actions to the store
* `action` - the action being performed, which will be a string of either `fetch, create, update, destroy`. Note that `fetch` is used both for `show` and `index` actions. Lastly the `fetch` option can be used to perform the request out of order. Normally the middleware will run before the request is performed. You must still resolve the request after fetching. This functionality can be used to implement caching. See `src/middleware.js` for an example.

Note that middleware will be applied to every request. If you need to apply middleware conditionally, you should determine that from the request object in the middleware function.

### Resource Configuration

Cnfiguration can be specified per resource

```javascript
apiActions(resource => {
  resource("users", { ...configuration })
})
```

Option | Type | Default | Description
------ | ---- | ------- | -----------
path | string | null | Generate routes using this path instead of the resource name
prefix | string | "" | Will be prepended to the generated route (e.g "/api" + "/users/:id")
domain | string | "" | Set the domain if it is not the current domain
options | function \| object | {} | Fetch options. If given a function, it will be called with `getState` as an argument and it should return an object
only | array | [] | Generate only the given routes (e.g. ["index"])
except | array | [] | Generate routes except the given (e.g. ["show", "update"])
readOnly | boolean | false | Do not generate formActions (more on this later)
singleton | boolean | false | Do not generate index action, do not use the `:id` param when retrieving the resource (e.g "/current_user")
meta | object \| function | {} | Add meta information to this action. Can be an object or a function that returns an object
routes | object | null | Customize the generated route set

Configuration at the resource level will override the global configuration.

### Customizing Routes

If your routes don't conform to the generated defaults you can customize them with the `routes` option.

For each route you can specify the following options:

Option | Type | Default | Description
------ | ---- | ------- | -----------
path | string | null | Generate routes using this path instead of the resource name
prefix | string | "" | Will be prepended to the generated route (e.g "/api" + "/users/:id")
domain | string | "" | Set the domain if it is not the current domain
options | function \| object | {} | Fetch options. If given a function, it will be called with `getState` as an argument and it should return an object
singleton | boolean | false | Do not generate index action, do not use the `:id` param when retrieving the resource (e.g "/current_user")
meta | object \| function | {} | Add meta information to this action. Can be an object or a function that returns an object

Configuration at the route level will override both the resource and global configuration:

```javascript
resource("projects", {
  prefix: "api",
  options: myOptions,
  routes: {
    index:  {
      path: "users/:user_id/projects/",
      prefix: "api/v1"
    },
    update: {
      path: "users/:user_id/projects/:id/",
      method: "PATCH",
      meta: (action, data, resp) => action == 'update' ? { merge: true } : {}
    }
  }
})
```
### Non-Standard Routes

If you need to add a request outside the typical REST requests you can do so via the add method on the generated resource:

```javascript
resource("projects")
  .add('some_name', { ...options })
```

This takes the same options as customizing routes above and will be available on the resources action creator object under the given name

```javascript
// Given the previous code
resourceActions.users.some_name(data, params, meta)
```

# Performing C\(r\)UD with Forms

While you can store temporary form data in a component's local state, the best practice is to use redux-api-resources and keep the form in the redux store. In addition to action creators that correspond with traditional REST routes, apiActions generates actions creators for working with form data.

```javascript
apiActions(resource => {
  resource("users")
})
```

Aside from the aforementioned action creators, this generates:

```javascript
// Populate a form with existing data
resourceActions.user.initializeForm(payload = {}, formKey = 'default'),

// Change a single form field. Meta should contain a single key 'field' with a value that is the field name
resourceActions.user.changeField(payload, meta),

// Clears a single field for in given form
resourceActions.user.clearField(field, formKey = 'default'),

// Clears all fields for a given form
resourceActions.user.clearForm(formKey = 'default'),
```

While you can work with these action creators if you prefer, `apiActions` also exposes a convenience wrapper around these action creators as well as the form state `formFor`.

```javascript
// Generates a convenience wrapper around the other form action creators and the form state
resourceActions.user.formFor(formKey = 'default')
```

When binding your action creators, you can use the `formFor` helper to generate any number of forms. In the following example we generate a form for the users resource. If no key is supplied the form will use the default key of `default`.
**Note that the `formFor` helper requires using [`redux-thunk`](https://github.com/gaearon/redux-thunk) with your store**.

```javascript
export default connect(
   dispatch => {
     const actions = bindActionCreators(resourceActions.users, dispatch),
           form = actions.formFor("my-unique-key")
     return { actions, form }
   }
)(App)
```

The generated form object has the following method:

* `init(object)` - initialize the form with data. This could either be nothing (i.e. you're creating a resource) or an object from your store (i.e. you're updating a resource)
* `clear(fieldName)` - If one or more fieldNames are supplied, clears the fields from the form. If no field is given, clears all fields from the form
* `change({ field: value... })` - Change one or more fields manually. Expects an object where the keys are fields and the values are the field values
* `errors(crudType)` - Form errors (where `crudType` is one of 'create', 'fetch', 'update', 'destroy')
* `state()` - The state of the form
* `field(fieldName, Options)` - Generates an object for reading and updating a form field

Instead of dispatching changeField actions, you should use the dynamic action creator _creator_ on the generated form object `field`. It takes a field name as an argument and an optional configuration object. This in turn generates an object with keys that correspond to typical form inputs `value`, `onChange` and `defaultValue`. By using the spread operator we add these properties to a form component. This sets the `onChange` event to dispatch events to update the store, and value displays the current value of the field in the store.

```javascript
class App extends React.Component {
  componentDidMount() {
    // Initialize our form with an empty object. When updating an existing
    // object, you'd initialize it with that object instead
    this.props.form.init()
  }

  onSubmit = () => {
    const { actions, form } = this.props
    // form.state() contains the current state of the form
    actions.create(form.state())
      //  If the action was successful clear the form
      .then(result => result.success && form.clear())
  }

  render(){
    const { form } = this.props
    const { field } = form
    // Specify we're interested in errors on create, could also be 'update',
    // or 'destroy'
    const errors = form.errors('create')

    return (
      <form>
        <label>Title</label>
        {/* set the value to the title field and dipatch on change */}
        <input type="text" {...field("title")} />
        {errors.title}
        <label>Content</label>
        {/* set the value to the title title and dipatch on change */}
        <textarea {...field("content")}></textarea>
        {errors.content}
        <Button onClick={this.onSubmit} text="Create Note"/>
      </form>
    )
  }
}
```

The field generator takes an optional configuration object

Option | Type | Default | Description
------ | ---- | ------- | -----------
property | string | null | If the field name doesn't correspond to the property in the redux store
valueKey | string | 'value' | Which UI property the value will set
eventType | string \| array | 'onChange' | The event(s) we're listening to. Can be a string or an array of strings
defaultValue | string | "" | Value for the input if none is specified
afterChange | function | (value, fieldData) => undefined | Callback fired immediately after and event is triggered, but before the store is updated
normalize | function | (value, fieldData) => value | Normalize input into the data that you want to in the Redux store.
format | function | (value, name) => value | Formats the value in the Redux store to be used in your input component
eventHandler | function | (e) => e && e.target ? e.target.value : e | receives the results of a given event. The handler should return the value for the store

The fieldData object contains useful information about the field such as the name, value, previous value, eventType (see `src/actions/form`)

## Reducers

The analogous reducer is defined similar to the action creators

```javascript
const resourceReducers = apiReducer(resource => {
  resource("users")
})
```

Option | Type | Default | Description
------ | ---- | ------- | -----------
idAttribute | String | "id" | The attribute which returns the records unique id, defaults to "id"
singleton | String | false | If the resource will only ever contain one object at a time (e.g. current user)
onUpdate | String | (prev, next) => next | Override how entities are updated. By default the newest version of the entity replaces the older.
entityReducer | Function | (action, data, meta) => data | Preprocess data before storing
formReducer | Function | resource => resource | Preprocess data for a form before storing
errorReducer | Function | (action, data, meta) => data | Preprocess errors before storing

The `formReducer`, `entityReducer` and `errorReducer` are for transforming API responses into the preferred format before data enters your store.

## Erata

While it isn't necessary to know this for working with `redux-api-resources`, resources are stored in the store in the following way:

```javascript
users: {
  // Ordered list of entity ids
  results: [id,id,id...],
  // Resource collection key:value pairs of id:entity
  entities: {
    id: { attributes },
    id: { attributes },
    ...
  },
  // Status of the current or last operation
  status: {
    fetch:   { pendingUpdate: false, id: null, success: true, payload: null },
    create:  { pendingUpdate: false, id: null, success: true, payload: null },
    update:  { pendingUpdate: false, id: 8, success: false, payload: { message: "Failure", errors: { "required_field": "cannot be empty" } } },
    destroy: { pendingUpdate: true, id: 45 }
  }
}
```

This is why it is necessary to transform the resource into an array in the example. Other convenience functions such as a `map`, `filter` and `reduce` are available for working with resources. See `src/utilities.js`.

The status object contains the status of a given crud operation. Each sub-object contains the following keys:

* `pendingUpdate` - Whether we still need to perform and update. This will be false until the request starts, and remain true until it completes successfully
* `success` - If our operation succeeded or not
* `id` - id of the record. Will be null for index actions
* `payload` - either a resource or error object

If you're using the `formFor` helper method it's not necessary to use the status object directly.


## Best Practices

* Flatten all your relationships. Even if a resource is never directly retrieved (i.e. nested associations) you should still create actions/reducers for them and dispatch the relationships to the store.

* Sort/filter/manipulate your resource when connecting your components to the redux store. The component should have no knowledge of how the resource is stored, and only operate on a list of resource objects.

  ```javascript
  connect(state => {
    const filteredTodos = filter(state.todos, () => /* ... Filter on some criteria */)
    return { todos: filteredTodos }
  })(App)
  ```
