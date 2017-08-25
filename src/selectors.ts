import { Id, Resource } from './types'

// iterate over entities in order
export function forEach<T>(resource: Resource<T>, fn: (entity: T) => void): void{
  return resource.results.forEach(id => fn(resource.entities[id]))
}

// Map entities
export function map<T>(resource: Resource<T>, fn: (entity: T, idx: number) => any = i => i): any[] {
  return resource.results.map((id,idx) => fn(resource.entities[id], idx))
}

// Converts entities into a plain array
export function toArray<T>(resource: Resource<T>): T[] {
  return map(resource)
}

// Filters a collection
export function filter<T>(resource: Resource<T>, fn: (entity: T) => any): T[] {
  const ret: T[] = []
  forEach(resource, (e) => { if (fn(e)) ret.push(e) })
  return ret
}

// Reduce entities into a new value
export function reduce<T>(resource: Resource<T>, fn: Function, init?: any): any {
  return resource.results.reduce((acc, id, idx, arr) => fn(acc, resource.entities[id], idx, arr), init)
}

// If given a predicate, returns the first entity that it returns true for, otherwise returns the first entity
export function first<T>(resource: Resource<T>, pred: (entity: T) => any = (e) => e): T | undefined {
  const id = resource.results.find((id: any) => pred(resource.entities[id]))
  return id ? resource.entities[id] : undefined
}

// If given a predicate, returns the last entity that it returns true for, otherwise returns the last entity
export function last<T>(resource: Resource<T>, pred: (entity: T) => any = (e) => e): T | undefined {
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
export function find<T>(resource: Resource<T>, id: any): T[]{
  const ids = Array.isArray(id) ? id : [id]
  const ret: T[] = []

  ids.forEach(id => {
    const e = resource.entities[id]
    if (e) ret.push(e)
  })

  return ret
}

// Returns all entities but the ones identified by the supplied ids
export function not<T>(resource: Resource<T>, id: any): T[]{
  const a = resource.results
  const b = Array.isArray(id) ? id : [id]
  return find(resource, a.filter(function(x) { return b.indexOf(x) < 0 }))
}

// Sort entities
export function sort<T>(resource: Resource<T>, fn: (a: T, b: T) => number): T[]{
  return map(resource, r => r).sort(fn)
}

export default {
  forEach,
  filter,
  first,
  find,
  last,
  map,
  not,
  reduce,
  sort,
  toArray,
}
