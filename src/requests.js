import queryString from 'query-string'
import { Headers } from "./headers"

export function get(route, config = {}){
  return request({ route, ...addMethod(config, 'GET') })
}

export function post(route, config = {}){
  return request({ route, ...addMethod(config, 'POST') })
}

export function put(route, config = {}){
  return request({ route, ...addMethod(config, 'PUT') })
}

export function patch(route, config = {}){
  return request({ route, ...addMethod(config, 'PATCH') })
}

export function del(route, config = {}){
  return request({ route, ...addMethod(config, 'DELETE') })
}

export function destroy(route, config) {
  return del(route, config)
}

function addMethod(config, method) {
  config.options ? config.options.method = method : config.options = { method }
  return config
}

/**
 * Make a fetch request
 * @param {Object} config - Request configutation
 * @param {String} config.route - Route to request. Routes aren't URLs in that they contain parameterized values that get replaced (e.g. :id)
 * @param {Object} config.params - The params used to generate a concrete URL from the route
 * @param {Object} config.data - Data to submit to the server
 * @param {Object} config.options - Fetch options for the request.
 */
export function request(config){
  return new Promise(function(resolve, reject){
    const { route, params = {}, data = null, options = {} } = config
    let url = parseRoute(route, params)

    if (options.method == "GET" || options.method == "DELETE") {
      url = addQueryString(url, params)
    } else {
      addPostData(options, data)
    }

    addHeaders(options, config)

    fetch(url, options)
      .then(resp => {
        let data
        const contentType = resp.headers.get("content-type")

        if (resp.status == 204)  {
          data = new Promise(r => r(""))
        } else {
          data = (contentType && contentType.indexOf("json") !== -1
            ? resp.json()
            : resp.text())
        }

        data.then(val => resp.ok ? resolve(val) : reject(val))
      })
  })
}

export function parseRoute(route, params) {
  let chunks = route.split("/")

  for (var i = 0, len = chunks.length; i < len; i++) {
    if (chunks[i][0] != ":") continue

    let key = chunks[i].slice(1),
        val = params[key]

    if (val) {
      delete params[key]
      chunks[i] = val
    } else {
      console.log(`missing '${key}' param for route '${route}'`)
    }
  }

  return chunks.join("/")
}

function addPostData(options, data) {
  if (!data) return

  const body = data instanceof FormData || typeof data == "string"
    ? data
    : JSON.stringify(data)

  options.body = body

  return options
}

// Attemp to detect what type of data we're submitting
function addHeaders(options, config) {
  const { method } = options
  const { data } = config
  let headers

  if (method == "GET" || method == "DELETE") {
    headers = Headers.URLENCODED
  } else {
    if (typeof data == "object" && !(data instanceof FormData)) {
      headers = Headers.JSON
    } else if (typeof data == "string") {
      try {
        JSON.parse(data)
        headers = Headers.JSON
      } catch (e) {
        headers = Headers.PLAIN
      }
    }
  }

  if (headers) options.headers = { ...headers, ...options.headers }

  return options
}

function addQueryString(route, params) {
  let qs = queryString.stringify(params)
  return qs === "" ? route : route + "?" + qs
}

