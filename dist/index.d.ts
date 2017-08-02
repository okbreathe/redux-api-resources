// Type definitions for redux-api-resources 0.8
// Project: https://github.com/okbreathe/redux-api-resources#readme
// Definitions by: Asher Van Brunt <http://okbreathe.com>
import { Reducer } from 'redux'

export const Headers: {
  JSON: {
    Accept: string
    "Content-Type": string
  }
  "JSON-API": {
    Accept: string
    "Content-Type": string
  }
  MULTIPART: {
    "Content-Type": string
  }
  PLAIN: {
    "Content-Type": string
  }
  URLENCODED: {
    "Content-Type": string
  }
}

export type Empty = boolean | null

export type Entities = {[key: string]: any}

export type ResourceActionTypes = {
  createFailure: string
  createStart: string
  createSuccess: string
  destroyFailure: string
  destroyStart: string
  destroySuccess: string
  fetchFailure: string
  fetchStart: string
  fetchSuccess: string
  updateFailure: string
  updateStart: string
  updateSuccess: string
  [key: string]: string
}

export type ResourceActions = {
  clearStatus: (actionName?: string) => Function
  fetchStart: (payload: any, meta?: any) => Action
  fetchSuccess: (payload: any, meta?: any) => Action
  fetchFailure: (payload: any, meta?: any) => Action
  updateStart: (payload: any, meta?: any) => Action
  updateSuccess: (payload: any, meta?: any) => Action
  updateFailure: (payload: any, meta?: any) => Action
  createStart: (payload: any, meta?: any) => Action
  createSuccess: (payload: any, meta?: any) => Action
  createFailure: (payload: any, meta?: any) => Action
  destroyStart: (payload: any, meta?: any) => Action
  destroySuccess: (payload: any, meta?: any) => Action
  destroyFailure: (payload: any, meta?: any) => Action
  [key: string]: any
}

export interface Status {
   pendingUpdate: Empty
   id?: string
   success: Empty
   payload: Empty
   busy: false
}

export interface ReduxResource {
  results: string[]
  entities: Entities
  status : {
    fetch: Status
    create: Status
    update: Status
    destroy: Status
  }
}

export interface Route {
  action: string
  route: string
  method: string
  options: any
  meta: any
  whiny: boolean
}

export interface Action {
  type: string
  payload: any
  error?: boolean
  meta?: any
}

declare class Router {
  constructor(config: { config: any, domain: string, prefix: string, middleware: Function[], optons: any, whiny: boolean })

  resource(name: string, resourceConfig: {}): Resource

  actions(): Resource
}

declare class Request {
  constructor(name: string, action: string, dispatch: Function, options: any, middlewares: any[])

  dispatch(action: string): any

  fetch(force: boolean): any

  setFetched(fetched : boolean): void

  setResponse(resp: any): any

  run(): Promise<{}>

  applyMiddleware(middleware: Function, resolveAll: Function, rejectAll: Function): Promise<{}>
}

declare class Resource {
  constructor(name: string, config: any, globalConfig: any)

  static restRoutes(resource: string, path?: string, sngl?: boolean): any

  static validMethod(str: string): boolean

  static validAction(str: string): boolean

  static defaultActionFor(method: string): any

  static globalOptions(): string[]

  actions(): any

  createRoutes(): any

  createAction(resourceRoute: Route): Function

  addMiddleware(middleware: Function): Resource

  removeMiddleware(middleware: Function): Resource

  applyMiddleware(name: string, action: string, dispatch: Function, options: any): Request

  add(name: string, config: { method?: string, action: string, route: string }): Resource
}

export function LoggingMiddleware(name: any, req: Request): void
export function MakeCache(Backend: any, expiresIn?: number, actions?: string[]): any
export function actionFor(resource: string, action?: string, status?: string): string
export function apiActions(configFunction: (resource: Resource) => void, ...args: any[]): void
export function apiReducer(fn: Function, config?: any): Function
export function del(route: string, config?: any): Promise<{}>
export function destroy(route: string, config: any): any
export function each(resource: ReduxResource, fn: Function): any
export function filter(resource: ReduxResource, predicate: Function): any[]
export function find(resource: ReduxResource, id: any): any
export function first(resource: ReduxResource, predicate?: Function): any
export function formActionTypes(resource: string): {
  init: string,
  change: string,
  clearField: string,
  clearForm: string
}
export function formActions(resource: string): {
  initializeForm(payload?: any, form?: string): Function,
  changeField(payload: any, meta: any): Function,
  clearField(field: any, form?: string): Function,
  clearForm(form?: string): Function,
  formFor(key?: string): Function
}
export function formReducer(resourceName: string, options?: any): any
export function get(route: string, config?: any): Promise<{}>
export function initialResourceState(): ReduxResource
export function jsonAPI(name: string, req: Request): void
export function last(resource: ReduxResource, predicate?: Function): any
export function map(resource: ReduxResource, fn?: Function): any[]
export function not(resource: ReduxResource, id: any): any[]
export function parseRoute(route: string, params: any): string
export function patch(route: string, config?: any): Promise<{}>
export function post(route: string, config?: any): Promise<{}>
export function put(route: string, config?: any): Promise<{}>
export function reduce(resource: ReduxResource, fn: Function, init: any): any
export function relationships(resource: ReduxResource, relationship: any): any
export function request(config: any): any
export function resourceActionTypes(resourceName: string): ResourceActionTypes
export function resourceActions(resourceName: string): ResourceActions
export function resourceFor(resourceName: string, options?: any): { types: ResourceActionTypes, actions: ResourceActions, reducer: Reducer<any> }
export function resourceReducer(resourceName: string, options?: any): Reducer<any>
export function sort(resource: ReduxResource, fn: Function): any[]
export function toArray(resource: ReduxResource): any[]
