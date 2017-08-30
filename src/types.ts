export type Entity = any

export type Id = string | number

export type Empty = boolean | null

export interface Action<T>{
  type: string
  payload: T
  error?: boolean
  meta?: any
}

export interface FormMeta {
  form: string
  field: string
}

export interface Status {
  pending: Empty
  success: Empty
  payload: any
  busy: boolean
}

export interface Resource<T> {
  results: Id[]
  entities: {[key: string]: T}
  meta: {[key: string]: any}
  changeset: {[key: string]: any}
  status: {
    fetch: Status
    create: Status
    update: Status
    destroy: Status
    [propName: string]: Status
  }
}

export interface ResourceReducerOptions<T> {
  idAttribute?: string
  onUpdate?: (prev: T, next: T) => T
  changesetReducer?: (form: any, changeset: any) => any
  entityReducer?: (action: string, payload: any, meta: any) => any
  errorReducer?: (action: string, payload: any, meta: any) => any
}

export type ResourceActionCreator<T> = (payload?: any, meta?: any) => Action<T>

export interface ResourceActions<T> {
    changesetSet: ResourceActionCreator<T>
 changesetRemove: ResourceActionCreator<T>
      fetchStart: ResourceActionCreator<T>
    fetchSuccess: ResourceActionCreator<T>
    fetchFailure: ResourceActionCreator<T>
      fetchClear: ResourceActionCreator<T>
     createStart: ResourceActionCreator<T>
   createSuccess: ResourceActionCreator<T>
   createFailure: ResourceActionCreator<T>
     createClear: ResourceActionCreator<T>
     updateStart: ResourceActionCreator<T>
   updateSuccess: ResourceActionCreator<T>
   updateFailure: ResourceActionCreator<T>
     updateClear: ResourceActionCreator<T>
    destroyStart: ResourceActionCreator<T>
  destroySuccess: ResourceActionCreator<T>
  destroyFailure: ResourceActionCreator<T>
    destroyClear: ResourceActionCreator<T>
    resourceForm: Function
}

export interface ResourceWithHelpers<T> extends Resource<T> {
  forEach: (fn: (entity: T) => void) => void
  filter: (pred: (entity: T) => any) => T[]
  first: (fn: (entity: T) => T | undefined) => T | undefined
  get: (fn: (entity: T) => T | undefined) => T[] | undefined
  last: (fn: (entity: T) => T | undefined) => T | undefined
  map: (fn: (entity: T, index: number) => any) => any[]
  not: (pred: (entity: T) => T | undefined) => T[]
  reduce: (fn: (entity: T) => any, init: any) => any
  sort: (fn: (a: T, b: T) => number) => T[]
  toArray: () => T[]
}
