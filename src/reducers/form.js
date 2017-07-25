export function formReducer(resourceName, options = {}){
  if (resourceName == null) throw new Error('[formReducer]: Expected resource name')

  options = Object.assign({
    // The form reducer gets a resource and should return a form representation
    // of it. In the simplest use case this can be identical to the resource
    // itself, however if you need to use the data with more complex form
    // widgets, you might need to transform it into a compatible object
    formReducer: (resource) => resource,
    // The change reducer gets a form, a field and value and should return the
    // changed form In the simplest use case it simply assigns the field the
    // value of the form
    changeReducer: (form, field, value) => ( { ...form, [field]: value } )
  }, options)

  let type = resourceName.toUpperCase()

  return function(state = {}, action){
    // Breaking up an action type like USERS/FORM/SUCCESS
    const [resource_type, , action_status] = action.type.split("/")

    if (resource_type == type) {
      let newState = Object.assign({}, state)
      const { payload, meta = {} } = action
      const { field = null, form  } = meta
      const { formReducer, changeReducer } = options

      switch (action_status) {
        case 'INITIALIZE':
          newState[form] = formReducer(payload) || {}
          break
        case 'CLEAR_FIELD':
          formExists(newState, form)
          delete newState[form][field]
          break
        case 'CLEAR_FORM':
          formExists(newState, form)
          newState[form] = {}
          break
        case 'CHANGE':
          formExists(newState, form)
          newState[form] = changeReducer(state[form], field, payload)
          break
      }
      return newState
    }
    return state
  }
}

function formExists(state, form) {
  if (!state[form]) console.error(`Form '${form}' is not set. Did you mean one of '${Object.keys(state).join(', ')}' `)
}
