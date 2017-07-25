import { resourceActionTypes, resourceActions } from './actions'
import { resourceReducer } from './reducers'

export * from './actions'
export * from './headers'
export * from './middleware'
export * from './reducers'
export * from './requests'
export * from './utilities'

export const resourceFor = (resourceName, reducerOptions = {}) => ({
  types: resourceActionTypes(resourceName),
  actions: resourceActions (resourceName),
  reducer: resourceReducer(resourceName, reducerOptions),
})
