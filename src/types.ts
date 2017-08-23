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

type ResourceActionCreator<T> = (payload?: any, meta?: any) => Action<T>

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
}
