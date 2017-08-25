import { ActionCreatorsMapObject } from 'redux'

import { Resource } from './types'

const defaultFormKey = 'default'

// The resource can either be derived from the Resource<T> (how?) or we can add a type property to the initialResourceState
// we'd need to pass the entire Resource into bindActionCreators
export default function(key = defaultFormKey) {
  return (dispatch: ActionCreatorsMapObject, getState: () => any) => {
    return {
      set(){
      },

      remove(){
      },

      /*
       * Clear given fields or entire form
       */
      clear(...fields: string[]) {
      },

      /**
       * Generates a field that dispatches change actions
       *
       * Use the field generator on a component
       * <input {...field("name", { options })} />
       */
      field(name: string, args: any) {
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
          afterChange = (value: any, fieldData: any) => undefined,
          // Ngrmalize input into the data that you want to in the Redux
          // store. Common use cases are for maintaining data as Numbers or
          // Dates in the store.
          normalize = (value: any, fieldData: any) => value,
          // Formats the value in the Redux store to be used in your input
          // component.
          format = (value: any, name: string) => value,
          // receives the results of a given event. Some events return Event
          // objects, other values. The handler should return the value for
          // the store
          eventHandler = (e: any, a: any, b: any, c: any) => e && e.target ? e.target.value : e
        } = (args || {})
        const field = property || name
        const form = getState()[resource].changeset[key] || {}
        const val = form[field]
        const handler = function(value: any, eventType: string){
          const fieldData = { field, name, property, value, eventType, previousValue: val }
          // const ret = changeField(dispatch, normalize(value, fieldData), key, field)
          afterChange(value, fieldData)
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
