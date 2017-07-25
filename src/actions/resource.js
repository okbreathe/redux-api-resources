const defaultActionTypes = {
  // Fetch
  // Takes one record or an array of records and adds them to the current
  // state. Uses the given key or id by default to merge.
  // Pass meta: { replace: true } to replace the current records instead
  RESOURCE_FETCH_START:     'RESOURCE/FETCH/START',
  RESOURCE_FETCH_SUCCESS:   'RESOURCE/FETCH/SUCCESS',
  RESOURCE_FETCH_FAILURE:   'RESOURCE/FETCH/FAILURE',
  // Create
  // Takes one record and adds it to the current state.
  RESOURCE_CREATE_START:    'RESOURCE/CREATE/START',
  RESOURCE_CREATE_SUCCESS:  'RESOURCE/CREATE/SUCCESS',
  RESOURCE_CREATE_FAILURE:  'RESOURCE/CREATE/FAILURE',
  // Update
  // Takes one record and merges it to the current state. Uses the given key or
  // id by default to merge.
  RESOURCE_UPDATE_START:    'RESOURCE/UPDATE/START',
  RESOURCE_UPDATE_SUCCESS:  'RESOURCE/UPDATE/SUCCESS',
  RESOURCE_UPDATE_FAILURE:  'RESOURCE/UPDATE/FAILURE',
  // Destroy
  // Removes the given record from the store.
  RESOURCE_DESTROY_START:   'RESOURCE/DESTROY/START',
  RESOURCE_DESTROY_SUCCESS: 'RESOURCE/DESTROY/SUCCESS',
  RESOURCE_DESTROY_FAILURE: 'RESOURCE/DESTROY/FAILURE',
}

const defaultActionCreators = {
  RESOURCE_FETCH_START:     'fetchStart',
  RESOURCE_FETCH_SUCCESS:   'fetchSuccess',
  RESOURCE_FETCH_FAILURE:   'fetchFailure',

  RESOURCE_UPDATE_START:    'updateStart',
  RESOURCE_UPDATE_SUCCESS:  'updateSuccess',
  RESOURCE_UPDATE_FAILURE:  'updateFailure',

  RESOURCE_CREATE_START:    'createStart',
  RESOURCE_CREATE_SUCCESS:  'createSuccess',
  RESOURCE_CREATE_FAILURE:  'createFailure',

  RESOURCE_DESTROY_START:   'destroyStart',
  RESOURCE_DESTROY_SUCCESS: 'destroySuccess',
  RESOURCE_DESTROY_FAILURE: 'destroyFailure',
}

/**
 * Generates a standard set of resource action types corresponding
 * to the defaultActionTypes above, where `RESOURCE` is replaced
 * with the given `resourceName`
 * @param {String} resourceName  - name of the resource
 * @return {Object}
 */
export function resourceActionTypes(resourceName) {
  if (resourceName == null) throw new Error('Expected resource name')

  resourceName = resourceName.toUpperCase()

  return Object.keys(defaultActionCreators).reduce((acc, k) => {
    acc[defaultActionCreators[k]] = defaultActionTypes[k].replace('RESOURCE', resourceName)
    return acc
  }, {})
}

/**
 * Generates a standard set of resource action creators corresponding to
 * the values of the defaultActionCreators above
 * @param {String} resourceName  - name of the resource
 * @return {Object}
 */
export function resourceActions(resourceName){
  if (resourceName == null) throw new Error('Expected resource name')

  const ret = { clearStatus: clearStatus(resourceName) }

  for (var key in defaultActionCreators) {
    ret[defaultActionCreators[key]] = createAction(createKey(resourceName, key))
  }

  return ret
}

/**
 * Generates a standard action
 * @param {String} resourceName - name of the resource
 * @param {String} action - action being performed -one of fetch, create, update, destroy, or clear
 * @param {String} status - lifecycle status - one of start, success, failure
 * @return {String}
 */
export function actionFor(resourceName, action = 'FETCH', status = "SUCCESS") {
  if (['START', 'SUCCESS', 'FAILURE', 'CLEAR'].indexOf(status.toUpperCase()) == -1) throw `Invalid status type '${status}'`
  if (['FETCH', 'CREATE', 'UPDATE', 'DESTROY'].indexOf(action.toUpperCase()) == -1) throw `Invalid action '${action}'`
  return `${resourceName}/${action}/${status}`.toUpperCase()
}

/**
 * Clears the status on a given resource for a given action, or all actions if
 * an action is omitted
 */
function clearStatus(resourceName){
  return (actionName) => {
    return (dispatch) => {
      (actionName ? [actionName] : ['fetch', 'create', 'update', 'destroy'])
        .forEach(a => dispatch({type: actionFor(resourceName, a, 'clear')}))
    }
  }
}

function createAction(type){
  return function(payload, meta){
    let ret =  { type: type, payload: payload }

    if (type.substr(-7) === "FAILURE") ret.error = true
    if (meta) ret.meta = meta

    return ret
  }
}

function createKey(str, key){
  return `${str.toUpperCase()}${defaultActionTypes[key].substr(8)}`
}
