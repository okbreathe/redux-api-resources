import pluralize from 'pluralize'
import { parseRoute, actionFor } from './'

/**
 * Simple logging middleware
 *
 * The JSON API spec returns included objects in the response.
 * This middleware will flatten them into their respective resources
 * automatically
 */
export const LoggingMiddleware = (name, req) => {
  console.log(`Request for ${name}`, req)
  req.resolve()
}

/**
 * Generate a JSON API middleware.
 *
 * The JSON API spec returns included objects in the response.
 * This middleware will flatten them into their respective resources
 * automatically
 */
export const jsonAPI = (name, req) => {
  req.fetch()
  .then(resp => {
    let bag = {}

    if (resp.included) {
      resp.included.forEach(entity => {
        let key = pluralize(entity.type)
        if (!bag[key]) bag[key] = []
        let results = bag[key]
        results.push(entity)
      })
    }

    for (var key in bag) {
      req.dispatch({ type: actionFor(key), payload: { data: bag[key] } })
    }

    req.resolve(resp)
  })
  .catch(req.reject)
}


/**
 * Generate a caching middleware.
 *
 * Note that this only works for React Native's AsyncStorage at the moment
 *
 * @param {Object} backend - AsyncStorage. LocalStorage backend coming soon
 * @param {Number} expiresIn - Number of seconds to expire in
 * @param {String[]} actions - Array of actions to cache. By default only fetch is cached
 */
export const MakeCache = (Backend, expiresIn = 600, actions = ["fetch"]) => {
  const CachingMiddleware = (name, req) => {
    // If we're not caching this type of action, move on to the next middleware
    if (actions.indexOf(req.action) == -1) req.resolve()

    const url = parseRoute(req.options.route, req.options.params)
    const cacheKey = [ req.action, url ].join("|")

    Backend.getItem(cacheKey).then(existing => {
      if (existing) {
        const { response, expires } = JSON.parse(existing)
        const now = new Date().getTime()

        if (expires > now) {
          console.log(`Returning cached results for '${url}'. Cache expires in: ${ Math.round( (expires - now) / 1000) } seconds`)
          return req.resolve(response)
        }
      }

      req.fetch()
      .then(resp => {
        console.log(`Fetching new results for '${url}'`)
        Backend.setItem(cacheKey, JSON.stringify({ respone: resp, expires: new Date().getTime() + expiresIn * 1000 }))
        req.resolve(resp)
      })
      .catch(req.reject)
    })
  }

  return CachingMiddleware
}
