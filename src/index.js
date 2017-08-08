import { resourceActionTypes, resourceActions, formActionTypes, formActions } from './actions'
import { resourceReducer, formReducer } from './reducers'

export * from './actions'
export * from './headers'
export * from './middleware'
export * from './reducers'
export * from './requests'
export * from './utilities'

export const resourceFor = (resourceName, reducerOptions = {}) => ({
  types: { ...formActionTypes(resourceName), ...resourceActionTypes(resourceName) },
  actions: { ...formActions(resourceName), ...resourceActions(resourceName) },
  reducer: resourceReducer(resourceName, reducerOptions),
  formReducer: formReducer(resourceName, reducerOptions),
})
