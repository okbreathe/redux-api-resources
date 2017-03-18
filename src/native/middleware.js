import { AsyncStorage } from 'react-native'
import { parseRoute } from '../'

/**
 * Generate a caching middleware
 * @param {Number} expiresIn - Number of seconds to expire in
 * @param {String[]} actions - Array of actions to cache. By default only fetch is cached
 */
export const MakeNativeCache = (expiresIn = 600, actions = ["fetch"]) => {
  const CachingMiddleware = (name, req) => {
    // If we're not caching this type of action, continue
    if (actions.indexOf(req.action) == -1) req.resolve()

    const url = parseRoute(req.options.route, req.options.params)
    const cacheKey = [ req.action, url ].join("|")

    AsyncStorage.getItem(cacheKey).then(existing => {
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
        AsyncStorage.setItem(cacheKey, JSON.stringify({ respone: resp, expires: new Date().getTime() + expiresIn * 1000 }))
        req.resolve(resp)
      })
      .catch(req.reject)
    })
  }
  return CachingMiddleware
}


