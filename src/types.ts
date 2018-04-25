import { ActionCreator } from 'redux'

export type Entity = any

export type Id = string | number

export type Empty = boolean | null

export interface Action<T> {
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
  entities: { [key: string]: T }
  meta: { [key: string]: any }
  changeset: { [key: string]: any }
  status: ResourceStatus
}

export interface ResourceStatus {
  fetch: Status
  create: Status
  update: Status
  destroy: Status
  [propName: string]: Status
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
  changesetMerge: ResourceActionCreator<T>
  changesetRemove: ResourceActionCreator<T>
  changesetReset: ResourceActionCreator<T>
  fetchStart: ResourceActionCreator<T>
  fetchSuccess: ResourceActionCreator<T>
  fetchFailure: ResourceActionCreator<T>
  fetchReset: ResourceActionCreator<T>
  createStart: ResourceActionCreator<T>
  createSuccess: ResourceActionCreator<T>
  createFailure: ResourceActionCreator<T>
  createReset: ResourceActionCreator<T>
  updateStart: ResourceActionCreator<T>
  updateSuccess: ResourceActionCreator<T>
  updateFailure: ResourceActionCreator<T>
  updateReset: ResourceActionCreator<T>
  destroyStart: ResourceActionCreator<T>
  destroySuccess: ResourceActionCreator<T>
  destroyFailure: ResourceActionCreator<T>
  destroyReset: ResourceActionCreator<T>
  metaReset: ResourceActionCreator<T>
  resourceReset: ResourceActionCreator<T>
  resourceForm: (key?: string) => FormHelper
  [key: string]: ActionCreator<any>
}

export interface ResourceActionTypes<T> {
  changesetMerge: string
  changesetRemove: string
  changesetReset: string
  fetchStart: string
  fetchSuccess: string
  fetchFailure: string
  fetchReset: string
  createStart: string
  createSuccess: string
  createFailure: string
  createReset: string
  updateStart: string
  updateSuccess: string
  updateFailure: string
  updateReset: string
  destroyStart: string
  destroySuccess: string
  destroyFailure: string
  destroyReset: string
  metaReset: string
  resourceReset: string
  [key: string]: string
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

export interface FormHelper {
  merge: (changes: { [key: string]: any }) => void
  remove: (...fields: string[]) => void
  reset: () => void
  errors: (action: string, fieldKey?: string) => any
  changeset: (...fields: string[]) => any
  field: FieldHelper
}

export type FieldHelper = (
  name: string,
  args?: FieldOptions
) => { name: string; [propName: string]: any }

export interface FieldOptions {
  storeKey?: string
  disabled?: boolean
  valueKey?: string
  eventType?: string | string[]
  defaultValue?: any
  afterEvent?: (value: any, fieldData: FieldData) => void
  normalize?: (value: any, fieldData: FieldData) => any
  format?: (value: any, name: string) => any
  eventHandler?: (...args: any[]) => any
}

export interface FieldData {
  field: string
  name: string
  storeKey?: string | null
  value: any
  eventType: string
  previousValue: any
}
