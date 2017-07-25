import { formActions, resourceActions } from './'
import { request } from '../'
import join from 'url-join'

class Router {
  /**
   * @constructor
   * @param {Object|Function} config - Default config used by all resources.
   * @param {String} config.domain - Domain of the API (optional)
   * @param {String} config.prefix - Path prefix to apply to each route (e.g. "/api/")
   * @param {Function[]} config.middleware - List of middlewares to apply when calling actions
   * @param {Object|Function} config.options - Fetch options. If given a function, it will be called with getState as an argument and it should return an object
   * @param {Boolean} config.whiny - Whether to log errors to the console
   */
  constructor(config = {}) {
    this.config = config
    this.resources = {}
  }

  /**
   * Add another set of resource action
   * @returns {Resource} - Actions keyed by resource name
   */
  resource = (name, resourceConfig = {}) => {
    const res = new Resource(name, resourceConfig, this.config)
    this.resources[name] = res
    return res
  }

  /**
   * Creates actions for use with redux
   * @returns {Object} - Actions keyed by resource name
   */
  actions(){
    return Object.keys(this.resources).reduce((rs,k) => {
      rs[k] = this.resources[k].actions
      return rs
    }, {})
  }
}

class Request {
  constructor(name, action, dispatch, options = {}, middlewares = []) {
    this.name        = name
    this.options     = options
    this.middlewares = middlewares
    this.action      = action
    this._dispatch   = dispatch
    this._fetched    = false
    this._request    = null
  }

  dispatch = (action) => this._dispatch(action)

  fetch = (force = false) => {
    const self = this

    if (!this._fetched || force) {
      this._fetched = true
      this._request = request(self.options)
    }

    return this._request
  }

  setFetched = (fetched = true) => this._fetched = fetched

  setResponse = (resp) => {
    this._fetched = true
    this._request = new Promise(res => res(resp))
    return this._request
  }

  run = () => {
    const { applyMiddleware, fetch } = this
    const m = this.middlewares.shift()
    return new Promise((res, rej) => {
      m
        ? applyMiddleware(m, res, rej)
        : fetch().then(res).catch(rej)
    })
  }

  applyMiddleware = (middleware, resolveAll, rejectAll) => {
    const { name, applyMiddleware, middlewares, fetch, setFetched, setResponse, dispatch, action, options } = this

    new Promise((resolve, reject) => middleware(name, { resolve, reject, fetch, setFetched, options, dispatch, action }))
      .then((result) => {
        if (result) setResponse(result)
        const next = middlewares.shift()
        next
          ? applyMiddleware(next, resolveAll, rejectAll)
          : fetch().then(resolveAll).catch(rejectAll)
      })
      .catch(rejectAll)
  }
}

class Resource {
  /**
   * @constructor
   * @param {String} name - Name of the RESTful resource
   * @param {Object} config - Configuration for resource
   * @param {String[]} config.path - Generate routes using this path instead of the resource name
   * @param {String[]} config.only - Generate only the given routes
   * @param {String[]} config.except - Generate routes except the given
   * @param {Boolean} config.singleton - Do not generate index action, does not use :id param
   * @param {Boolean} config.readonly - Don't generate form actions (default: false)
   * @param {Object|Function} config.meta - Add meta information to this action. Can be an object or a function that returns an object
   * @param {Object} config.routes - If each a given resource has multiple paths, specify it here (e.g. { index: "/some/path", show: "/some/other/path" })
   * If you need to specify the method of the request you can pass an object (e.g. routes: { update: { method: "PATCH", path: "/some/path" } })
   */
  constructor(name, config, globalConfig) {
    this.name           = name
    this.config         = config
    this.globalConfig   = globalConfig
    this.allActions     = config.readonly ? resourceActions(name) : { ...formActions(name), ...resourceActions(name) }
    this._middleware    = {}
    this._routes       = this.createRoutes()
    this._middlewareId  = 1000
    // TODO Should this be available to resources and router or one or the other
    if (globalConfig.middleware) globalConfig.middleware.forEach(m => this.addMiddleware(m))
    if (config.middleware) config.middleware.forEach(m => this.addMiddleware(m))
  }

  static restRoutes(resource, path = null, sngl = false){
    path = path || resource

    const idSegment = sngl ? "" : "/:id"
    const routes = {
      show:    { method: "GET",    path: `/${path}${idSegment}`},
      create:  { method: "POST",   path: `/${path}`},
      update:  { method: "PUT",    path: `/${path}${idSegment}`},
      destroy: { method: "DELETE", path: `/${path}${idSegment}`}
    }
    return sngl ? routes : {...routes, index: { method: "GET", path: `/${path}`}}
  }

  static validMethod(str) {
    return ['GET','POST','PUT','PATCH','DELETE'].indexOf(str.toUpperCase()) > -1
  }

  static validAction(str) {
    return str && ['FETCH', 'CREATE', 'UPDATE', 'DESTROY'].indexOf(str.toUpperCase()) > -1
  }

  static defaultActionFor(method) {
    return { GET: 'fetch', POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'destroy' }[method]
  }

  static globalOptions = () => ['meta', 'domain', 'prefix', 'options']

  /**
   * Returns a set of actions for this resource
   * @returns {Object} - Actions keyed by resource name
   */
  get actions(){
    return {
      ...this.allActions,
      ...Object.keys(this._routes).reduce((ret, k) => {
        ret[k] = this.createAction(this._routes[k])
        return ret
      }, {})
    }
  }

  // Combine are global options into our resource options into our route options
  createRoutes(){
    const { path = null, only = null, except = [], singleton = false, routes = {} } = this.config
    const defaultRoutes = Resource.restRoutes(this.name, path, singleton)
    const allowedRoutes = only ? only : Object.keys(defaultRoutes).filter(r => except.indexOf(r) == -1 )

    // Loop over generated routes and combine options from the top down
    return allowedRoutes.reduce((routeSet, name) => {
      const route = routes[name] || {}
      const defaultRoute = defaultRoutes[name]
      const resourceOptions = Resource.globalOptions().reduce((m,o) => { if (this.config[o]){ m[o] = this.config[o] }; return m }, {})
      const combined = { ...this.globalConfig, ...resourceOptions, ...defaultRoute, ...route }

      combined.route = join.apply(null, [combined.domain, combined.prefix, combined.path].filter(str => str && str.trim() !== ""))
      combined.action = combined.action || Resource.defaultActionFor(combined.method)
      routeSet[name] = combined

      return routeSet
    }, {})
  }

  /**
   * Generates a redux action creator
   * @return {Function} Action creator that takes a data object and optionally a params object to build the request
   */
  createAction(resourceRoute){
    const { action, route, method, options, meta, whiny } = resourceRoute
    const { name, allActions, applyMiddleware } = this

    return function(data, params){
      return (dispatch, getState) => {
        dispatch(allActions[`${action}Start`]())
        params = params || { ...data }
        const reqOptions = { method, ...(typeof options == "function" ? options(getState) : options) }
        return applyMiddleware(name, action, dispatch, { route, data, params, options: reqOptions })
          .then(resp => {
            const type       = `${action}Success`,
                  actionFn   = allActions[type],
                  payload    = method == "DELETE" ? data : resp,
                  actionMeta = typeof meta == "function" ? meta(action, data, resp) : meta
            dispatch(actionFn(payload, actionMeta))
            return { type, payload, meta: actionMeta, success: true }
          })
          .catch(err => {
            const type = `${action}Failure`,
                  actionFn = allActions[type]
            if (whiny) console.log(err)
            dispatch(actionFn(err))
            return { type, payload: err, success: false }
          })
      }
    }
  }

  addMiddleware = (middleware) => {
    if (!middleware._middlewareId) middleware._middlewareId = this._middlewareId++
    this._middleware[middleware._middlewareId] = middleware
    return this
  }

  removeMiddleware = (middleware) => {
    const id = middleware._middlewareId
    if (!id) return
    if (this._middleware[id]) delete this.middleware[id]
    return this
  }

  applyMiddleware = (name, action, dispatch, options) => {
    return new Request(name, action, dispatch, options, Object.values(this._middleware)).run()
  }

  // Add a non-restful route action
  add = (name, config) => {
    const { method = "GET", action, route } = config

    if (!Resource.validMethod(method)) throw new Error(`Invalid HTTP method ${method}`)
    if (this._routes[name]) throw new Error(`Action ${name} already exists`)
    if (!route) throw new Error('Required value "route" missing from configuration')
    if (!action) config.action = Resource.defaultActionFor(method)
    if (!Resource.validAction(config.action)) throw new Error(`Invalid action '${config.action}' given`)

    this._routes[name] = config

    return this
  }
}

export function apiActions(configFunction, config = {}) {
  const router = new Router(config)
  configFunction(router.resource)
  return router.actions()
}
