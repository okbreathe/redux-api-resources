import resourceActionTypes from './action_types'
import resourceActions from './actions'
import resourceReducer from './reducer'

export { resourceActionTypes, resourceActions, resourceReducer }

export * from './selectors'

export default function resourceFor(resourceName: string){
  return {
    types: resourceActionTypes(resourceName),
    actions: resourceActions(resourceName),
    reducer: resourceReducer(resourceName),
  }
}
