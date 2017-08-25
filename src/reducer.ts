import { Action, Status, Resource } from './types'

interface ResourceReducerOptions<T> {
  idAttribute?: string
  singleton?: boolean
  onUpdate?: (prev: T, next: T) => T
  changesetReducer?: (form: any, changeset: any) => any
  entityReducer?: (action: string, payload: any, meta: any) => any
  errorReducer?: (action: string, payload: any, meta: any) => any
}

export function initialResourceState<T>(): Resource<T> {
  return {
    results: [],
    entities: {},
    meta: {},
    changeset: {},
    status : createStatus()
  }
}

export default function resourceReducer<T>(resourceName: string, options?: ResourceReducerOptions<T>){
  if (!resourceName) throw new Error('[resourceReducer]: Expected resource name')

  const name = resourceName.toUpperCase()

  options = {
    idAttribute: "id",
    singleton: false,
    onUpdate: (prev, next) => next,
    changesetReducer: (form, changeset) => ({ ...form, ...changeset}),
    entityReducer: (action, payload, meta) => payload,
    errorReducer: (action, payload, meta) => payload,
    ...options,
  }

  return function(state = initialResourceState<T>(), action: Action<T>){
    // We're breaking up a string like USERS/FETCH/SUCCESS or USERS/CHANGESET/SET
    const [actionName, actionDomain, actionMethod] = action.type.split("/")

    if (name == actionName) {
      switch (actionDomain) {
        case 'CHANGESET': return handleChangeset(actionDomain, actionMethod, action, state, options)
        default         : return handleResource(actionDomain, actionMethod, action, state, options)
      }
    }

    return state
  }
}

function handleResource(domain: string, method: string, action: Action<any>, state: Resource<any>, options: any): Resource<any> {
  const newState = { ...state, status: {...state.status} }
  switch (method) {
    case 'START'   : return handleStart(domain, action, newState, options)
    case 'SUCCESS' : return handleSuccess(domain, action, newState, options)
    case 'FAILURE' : return handleFailure(domain, action, newState, options)
    case 'CLEAR'   : return handleClear(domain, action, newState, options)
  }
  return state
}

function handleChangeset(domain: string, method: string, action: Action<any>, state: Resource<any>, options: any): Resource<any> {
  const { changesetReducer, changeReducer } = options
  let newState = { ...state, changeset: {...state.changeset} }
  const { payload, meta = {} } = action
  const { form = 'default' } = meta

  switch (method) {
    case 'SET':
      newState.changeset[form] = changesetReducer(state.changeset[form], payload)
      break
    case 'REMOVE':
      if (Array.isArray(payload)) {
        payload.forEach((field: string) => {
          delete newState.changeset[form][field]
        })
      } else {
        newState.changeset[form] = {}
      }
      break
  }

  return newState
}

function handleClear(crudType: string, action: Action<any>, state: Resource<any>, options: any): Resource<any> {
  state.status[crudType.toLowerCase()] = defaultStatus()
  return state
}

function handleStart(crudType: string, action: Action<any>, state: Resource<any>, options: any){
  state.status[crudType.toLowerCase()] = {
    pending: true,
    busy: true,
    success: null,
    payload: action.payload
  }
  return state
}

function handleSuccess(crudType: string, action: Action<any>, state: Resource<any>, options: any){
  let { status } = state
  let { payload, meta, error } = action

  if (!payload) return state

  const newState = {
    results: state.results.slice(0),
    entities: {...state.entities},
    status: {
      ...status,
      [crudType.toLowerCase()]: {
        pending: false,
        busy: false,
        success: true,
        payload: payload
      }
    },
    meta: { ...state.meta, ...action.meta },
    changeset: state.changeset
  }

  const data = options.entityReducer(crudType, payload, meta)

  return crudType == "DESTROY"
    ? destroyInResource(data, action, newState, options)
    : updateInResource(data, action, newState, options)
}

function updateInResource(payload: any, action: Action<any>, state: Resource<any>, options: any){
  const { results, entities } = state

  payload = Array.isArray(payload) ? payload : [payload]
  payload.forEach((obj: any) => {
    const id = obj[options.idAttribute]

    if (id) {
      if (results.indexOf(id) == -1) results.push(id)
      entities[id] = options.onUpdate(entities[id], obj)
    } else {
      console.warn(`Missing '${options.idAttribute}' unable to add data to store`)
    }
  })

  return state
}

function destroyInResource(payload: any, action: Action<any>, state: Resource<any>, options: any){
  const { results, entities } = state

  payload = Array.isArray(payload) ? payload : [payload]
  payload.forEach((obj: any) => {
    const id  = typeof obj === "number" || typeof obj === "string" ? obj : obj[options.idAttribute]
    console.log(id)
    const idx = results.indexOf(id)

    if (idx > -1) results.splice(idx, 1)
    delete entities[id]
  })

  return state
}

function handleFailure(crudType: string, action: Action<any>, state: Resource<any>, options: any){
  state.status[crudType.toLowerCase()] = {
    pending: true,
    busy: false,
    success: false,
    payload: action.payload ? options.errorReducer(crudType, action.payload, action.meta) : null
  }
  return state
}

function createStatus(){
  return ['fetch','create','update','destroy'].reduce((acc: any, key) => {
    acc[key] = defaultStatus()
    return acc
  }, {})
}

function defaultStatus(){
  return { pending: null, id: null, success: null, payload: null, busy: false }
}
