/**
 * Creates a reducer function for the given resource.
 *
 * @param {String} name - Name of the resource
 * @param {Object} options - Options for resource
 * @param {String} options.idAttribute - The attribute which returns the records unique id, defaults to "id"
 * @param {String} options.singleton - If the resource will only ever contain one object at a time (e.g. current user)
 * @param {String} options.onUpdate - Override how entities are updated. By default the newest version of the entity replaces the older.
 * @param {Function} options.entityReducer - Preprocess data
 * @param {Function} options.errorReducer - Preprocess errors
 * @return {Function} A reducer
*/
export function resourceReducer(str, options = {}){
  if (!str) throw new Error('[resourceReducer]: Expected resource name')

  let type = str.toUpperCase()

  options = {
    idAttribute: "id",
    singleton: false,
    onUpdate: (prev, next) => next,
    entityReducer: (action, data, meta) => data,
    errorReducer: (action, data, meta) => data,
    ...options,
  }

  const initialState = initialResourceState()

  return function(state = initialState, action){
    // We're breaking up a string like USERS/FETCH/SUCCESS
    const [resource_type, crud_type, action_status] = action.type.split("/")

    if (resource_type == type) {
      // Don't mutate state
      let newState = { results: state.results.slice(0), entities: {...state.entities}, status: {...state.status}, type }

      switch (action_status) {
        case 'CLEAR':
          handleClear(crud_type, newState)
          break
        case 'START':
          handleStart(crud_type, action, newState)
          break
        case 'SUCCESS':
          handleSuccess(crud_type, action, newState, options)
          break
        case 'FAILURE':
          handleFailure(crud_type, action, newState, options)
          break
      }
      return newState
    }
    return state
  }
}

/*
 * The initial state for our resourceReducer. Generally you won't
 * need to use this unless you're implementing your own reducer
 * @return {Object} The initial state
 */
export function initialResourceState(){
  return { results: [], entities: {}, status : createStatus() }
}

function handleStart(crud_type, action, state){
  state.status[crud_type.toLowerCase()] = {
    pendingUpdate: true,
    busy: true,
    success: null,
    payload: action.payload,
    id: action.meta ? action.meta.id : null
  }
}

function handleSuccess(crud_type, action, state, options){
  const { entityReducer, idAttribute, onUpdate, singleton } = options
  let { results, entities, status } = state
  let { payload } = action

  if (!payload) return

  status[crud_type.toLowerCase()] = {
    pendingUpdate: false,
    busy: false,
    success: true,
    payload: payload,
    id: action.meta ? action.meta.id : null
  }

  if (crud_type == "DESTROY") {
    singleton
      ? destroySingleton(payload, state)
      : destroyInCollection(payload, results, entities, idAttribute)
  } else {
    if (action.meta && action.meta.replace) {
      results.length = 0
      entities = state.entities = {}
    }

    payload = entityReducer(crud_type, payload, action.meta)

    singleton
      ? updateSingleton(payload, state, onUpdate)
      : updateCollection(payload, results, entities, idAttribute, onUpdate)
  }
}

function updateCollection(payload, results, entities, idAttribute, onUpdate){
  payload = Array.isArray(payload) ? payload : [payload]
  payload.forEach(obj => {
    let id = obj[idAttribute]

    if (id) {
      id = `${id}`
      if (results.indexOf(id) == -1) results.push(id)
      entities[id] = onUpdate(entities[id] || {}, obj)
    } else {
      console.warn(`Missing '${idAttribute}' unable to add data to store`)
    }
  })
}

function destroyInCollection(payload, results, entities, idAttribute){
  const id  = `${payload[idAttribute]}`
  const idx = results.indexOf(id)
  if (idx > -1) results.splice(idx, 1)
  delete entities[id]
}

function updateSingleton(payload, state, onUpdate){
  const updated = onUpdate(state.entities || {}, payload)
  state.entities = updated
  state.results[0] = updated
}

function destroySingleton(payload, state){
  state.results.length = 0
  state.entities = {}
}

function handleFailure(crud_type, action, state, options){
  state.status[crud_type.toLowerCase()] = {
    pendingUpdate: true,
    busy: false,
    success: false,
    payload: action.payload ? options.errorReducer(crud_type, action.payload, action.meta) : null,
    id: action.meta ? action.meta.id : null
  }
}

function handleClear(crud_type, state){
  state.status[crud_type.toLowerCase()] = defaultStatus()
}

function createStatus(){
  return ['fetch','create','update','destroy'].reduce((acc,key) => {
    acc[key] = defaultStatus()
    return acc
  }, {})
}

function defaultStatus(){
  return { pendingUpdate: null, id: null, success: null, payload: null, busy: false }
}
