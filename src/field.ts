import { Resource } from './types'

export default function field(resource: Resource<any>, formKey: string, fieldName: string, args: any = {}){
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
    // Normalize input into the data that you want to in the Redux
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
  } = args

  const field = property || fieldName
  const form = resource.changeset[formKey] || {}
  const val = form[fieldName]
  const handler = function(value: any, eventType: string){
    const fieldData = { field, name, property, value, eventType, previousValue: val }
    // const ret = changeField(dispatch, normalize(value, fieldData), key, field)
    const ret = "FIXME"
    afterChange(value, fieldData)
    return ret
  }
  const ret = {
    name: fieldName,
    [valueKey]: format(val === undefined || val === null ? defaultValue : val, fieldName),
  }
  const eventTypes = Array.isArray(eventType) ? eventType : [eventType]

  eventTypes.forEach((str: string) => ret[str] = (e: any, a: any, b: any, c: any) => handler(eventHandler(e,a,b,c), str))

  return ret
}
