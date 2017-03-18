// iterating over entities in order
export function each(resource, fn){
  return resource.results.forEach(id => fn(resource.entities[id]))
}

// Returns a new collection
export function map(resource, fn = i => i){
  return resource.results.map((id,idx) => fn(resource.entities[id], idx))
}

export function toArray(resource) {
  return map(resource)
}

// Filters a collection
export function filter(resource, fn){
  let ret = []
  each(resource, (e) => { if (fn(e)) ret.push(e) })
  return ret
}

// Returns a new value
export function reduce(resource, fn, init){
  return resource.results.reduce((acc, id, idx, arr) => fn(acc, resource.entities[id], idx, arr), init)
}

// Retrieves the first entity
export function first(resource){
  return resource.entities[resource.results[0]]
}

// Retrieves the last entity
export function last(resource){
  return resource.entities[resource.results[resource.results.length - 1]]
}

// Retrieves one or more entities
// This is identical to calling store.[resource].entities[id]
export function find(resource, id){
  const ids = Array.isArray(id) ? id : [id]
  let ret = []
  ids.forEach(id => ret.push(resource.entities[id]))
  return ret.length == 1 ? ret[0] : ret
}

// Returns all entities but the ones identified by the supplied ids
export function not(resource, id){
  const a = resource.results
  const b = Array.isArray(id) ? id : [id]
  return find(resource, a.filter(function(x) { return b.indexOf(x) < 0 }))
}

// Returns all the relationships for a single entity and a resource collection
export function relationships(resource, relationship) {
  if (!relationship.data) return []
  return relationship.data.reduce((acc,cur) => {
    const child = resource.entities[cur.id]
    if (child) acc.push(child)
    return acc
  }, [])
}

export function sort(resource, fn){
  return map(resource, r => r).sort(fn)
}

export default {
  each,
  filter,
  first,
  find,
  last,
  map,
  not,
  reduce,
  sort,
  relationships,
  toArray,
}
