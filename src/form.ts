import { ActionCreatorsMapObject } from 'redux'

import { ResourceActions, Resource } from './types'

const defaultFormKey = 'default'
const crudActions = ['fetch','create','update','destroy']

export default function<T>(resourceName: string, actions: ResourceActions<T>) {
  return function(key = defaultFormKey) {
    return (dispatch: Function, getState: () => any) => {
      return {
        /*
         * Add or replace given fields given fields
         */
        set(changes: { [key: string]: any }){
          dispatch(actions.changesetSet(changes, { form: key }))
        },

        /*
         * Remove given fields
         */
        remove(...fields: string[]){
          dispatch(actions.changesetRemove(fields, { form: key }))
        },

        /*
         * Clear changeset
         */
        reset() {
          dispatch(actions.changesetReset(null, { form: key }))
        },

        /*
         * Return the current form errors
         */
        errors(action: string, fieldKey: string = "") {
          action = action.toLowerCase()

          if (crudActions.indexOf(action) == -1) {
            console.warn(`Invalid action type ${action}. Must be one of ${crudActions.join(', ')}`)
            return {}
          }

          const status = getState()[resourceName].status
          const errors = !status[action].success && status[action].payload || {}

          return fieldKey
            ? errors[fieldKey]
            : errors
        },

        /*
         * Return the current state of the form.
         *
         * Returns all fields by default but can be limited to selected
         * fields by passing the field names in as arguments
         */
        changeset(...fields: string[]) {
          const state = getState()[resourceName].changeset[key] || {}
          return fields.length
            ? fields.reduce((acc: any, f) => { acc[f] = state[f]; return acc }, {})
            : state
        },

        /**
         * Generates a field that dispatches change actions
         *
         * Use the field generator on a component
         * <input {...field("name", { options })} />
         */
        field(name: string, args: any) {
          if (args && args.disabled) return {}

          let {
            // By default the name of this field will be used as the key in the
            // changeset. You can use a different key in the store by
            // specifying a storeKey
            storeKey = null,
            // Which property that will be set when the field changes
            valueKey = 'value',
            // The events we're listening to. Can be a string or an array of strings
            eventType = 'onChange',
            // The value used if no value currently exists in the changeset
            defaultValue = "",
            // Callback fired immediately after and event is triggered, but
            // before the store is updated
            afterEvent = (value: any, fieldData: any) => undefined,
            // Normalize input for the Redux store. Common use cases are
            // maintaining data as Numbers or Dates in the store, while
            // displaying them differently
            normalize = (value: any, fieldData: any) => value,
            // Formats the value in the Redux store to be used in your input
            // component. Used in conjunction with normalize to maintain the
            // correct state and view types
            format = (value: any, name: string) => value,
            // Handles all events specified by `eventType` Should return the
            // value for the store
            eventHandler = (e: any, a: any, b: any, c: any) => e && e.target ? e.target.value : e
          } = (args || {})
          const field = storeKey || name
          const form = getState()[resourceName].changeset[key] || {}
          const val = form[field]
          const handler = function(value: any, eventType: string){
            const fieldData = { field, name, storeKey, value, eventType, previousValue: val }
            const ret = dispatch(actions.changesetSet({ [field]: normalize(value, fieldData) }, { form: key }))
            afterEvent(value, fieldData)
            return ret
          }
          const ret = {
            name: name,
            [valueKey]: format(val === undefined || val === null ? defaultValue : val, name),
          }
          const eventTypes = Array.isArray(eventType) ? eventType : [eventType]

          eventTypes.forEach((str: string) => ret[str] = (e: any, a: any, b: any, c: any) => handler(eventHandler(e,a,b,c), str))

          return ret
        }
      }
    }
  }
}
