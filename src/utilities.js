// iterate over entities in order
export function each(resource, fn){
  return resource.results.forEach(id => fn(resource.entities[id]))
}

// Map entities
export function map(resource, fn = i => i){
  return resource.results.map((id,idx) => fn(resource.entities[id], idx))
}

// Converts entities into a plain array
export function toArray(resource) {
  return map(resource)
}

// Filters a collection
export function filter(resource, fn) {
  let ret = []
  each(resource, (e) => { if (fn(e)) ret.push(e) })
  return ret
}

// Reduce entities into a new value
export function reduce(resource, fn, init){
  return resource.results.reduce((acc, id, idx, arr) => fn(acc, resource.entities[id], idx, arr), init)
}

// If given a predicate, returns the first entity that it returns true for, otherwise returns the first entity
export function first(resource, pred = i => i){
  return resource.entities[resource.results.find(id => pred(resource.entities[id]))]
}

// If given a predicate, returns the last entity that it returns true for, otherwise returns the last entity
export function last(resource, pred = i => i){
  let ret
  let i = resource.results.length

  while(i--) {
    ret = resource.entities[resource.results[i]]
    if (pred(ret)) break
  }

  return ret
}

// Retrieves one or more entities
// This is identical to calling store.[resource].entities[id]
export function find(resource, id){
  const ids = Array.isArray(id) ? id : [id]
  let ret = []
  ids.forEach(id => {
    const e = resource.entities[id]
    if (e) ret.push(e)
  })
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

// Sort entities
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
