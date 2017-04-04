const defaultFormKey = 'default'

const actions = ['fetch','create','update','destroy']

// Generate action types
export const formActionTypes = (resource) => {
  resource = resource.toUpperCase()
  return {
    init:       `${resource}/FORM/INITIALIZE`,
    change:     `${resource}/FORM/CHANGE`,
    clearField: `${resource}/FORM/CLEAR_FIELD`,
    clearForm:  `${resource}/FORM/CLEAR_FORM`
  }
}

export function formActions(resource){
  const types = formActionTypes(resource)

  const initializeForm = (dispatch, payload, form) => dispatch({ type: types.init, payload, meta: { form } })

  const changeField = (dispatch, payload, form, field) => dispatch({ type: types.change, payload, meta: { field, form } })

  const clearField = (dispatch, form, field) => dispatch({ type: types.clearField, meta: { field, form } })

  const clearForm = (dispatch, form) => dispatch({ type: types.clearForm, meta: { form } })

  return {
    // Populate a form with existing data
    initializeForm(payload = {}, form = defaultFormKey){
      return dispatch => initializeForm(dispatch, payload, form)
    },

    // Change a single form field
    changeField(payload, meta){
      const { field, form = defaultFormKey } = meta
      return dispatch => changeField(dispatch, payload, form, field)
    },

    // Clears a single field for in given form
    clearField(field, form = defaultFormKey){
      return dispatch => clearField(dispatch, form, field)
    },

    // Clears all fields for a given form
    clearForm(form = defaultFormKey){
      return dispatch => clearForm(dispatch, form)
    },

    // Convenience wrapper around the default action creators
    formFor(key = defaultFormKey) {
      return (dispatch, getState) => {
        return {
          /*
           * Copy the payload into an editable form object
           */
          init(payload) {
            return initializeForm(dispatch, payload, key)
          },
          /*
           * Clear given fields or entire form
           */
          clear(...fields) {
            return fields.length
              ? fields.map(f => clearField(dispatch, key, f))
              : clearForm(dispatch, key)
          },
          /*
           * Change given fields
           * Expects keys to be field names and values to be field values
           */
          change(fields = {}) {
            return Object.keys(fields).map(k => changeField(dispatch, fields[k], key, k))
          },
          /*
           * Return the current form errors
           */
          errors(action, fieldKey = null) {
            action = (action || "").toLowerCase()
            if (actions.indexOf(action) == -1) {
              console.warn(`Invalid action type ${action}. Must be one of ${actions.join(', ')}`)
              return {}
            }
            const status = getState()[resource].status
            const errors = !status[action].success && status[action].payload || {}

            return fieldKey
              ? errors[fieldKey]
              : errors
          },
          /*
           * Return the current state of the form
           */
          state() {
            return getState()[resource + 'Form'][key] || {}
          },
          /**
           * Generates a field that dispatches change actions
           * Use the field generator on a component
           * <input {...field("name", { options })} />
           */
          field(name, ...args) {
            if (args[0] === false) return {}

            let {
              // If the field name doesn't correspond to the property in the
              // redux store
              property = null,
              // Which UI property the value will set
              valueKey = 'value',
              // Which events we're listening to. Can be a string or an array of strings
              eventType = 'onChange',
              // Value for the input if none is specified
              defaultValue = "",
              // Callback fired immediately after and event is triggered, but
              // before the store is updated TODO change to afterEvent
              afterChange = (_value, _fieldData) => undefined,
              // Normalize input into the data that you want to in the Redux
              // store. Common use cases are for maintaining data as Numbers or
              // Dates in the store.
              normalize = (value, _fieldData) => value,
              // Formats the value in the Redux store to be used in your input
              // component.
              format = (value, _name) => value,
              // receives the results of a given event. Some events return Event
              // objects, other values. The handler should return the value for
              // the store
              eventHandler = (e,_a,_b,_c) => e && e.target ? e.target.value : e
            } = (args.pop() || {})
            const field = property || name
            const form = getState()[resource + 'Form'][key] || {}
            const val = form[field]
            const handler = function(value, eventType){
              const fieldData = { field, name, property, value, eventType, previousValue: val }
              const ret = changeField(dispatch, normalize(value, fieldData), key, field)
              afterChange(value, fieldData)
              return ret
            }
            const ret = {
              name: name,
              [valueKey]: format(val === undefined || val === null ? defaultValue : val, name),
            }

            eventType = Array.isArray(eventType) ? eventType : [eventType]
            eventType.forEach(str => ret[str] = (e,a,b,c) => handler(eventHandler(e,a,b,c), str))

            return ret
          }
        }
      }
    }
  }
}
