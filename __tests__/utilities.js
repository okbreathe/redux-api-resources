/*eslint-env jest */

import allUsers from './fixtures/users.json'
import {
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
} from '../src'

const users = allUsers.slice(0,3)

const resource = {
  results: users.map(u => u.id),
  entities: users.reduce((acc, u) => { acc[u.id] = u; return acc }, {})
}

test('each iterates over entities in order', () => {
})

test('map entities', () => {
  expect(map(resource, r => r.id)).toEqual(["1", "2", "3"])
})

test('toArray converts entities into a plain array', () => {
  expect(toArray(resource)).toEqual(users)
})

test('filter entities', () => {
  expect(filter(resource, u => u.id == "1")).toEqual([users[0]])
})

test('reduce entities into a new value', () => {
})

//
test('first - return returns the first entity for its predicate', () => {
  expect(first(resource)).toEqual(users[0])
  expect(first(resource, u => u.id == "2")).toEqual(users[1])
})

test('last - return returns the last entity for its predicate', () => {
  expect(last(resource)).toEqual(users[2])
  expect(last(resource, u => u.id == "3")).toEqual(users[2])
})

test('find - get entities with given ids', () => {
  expect(find(resource, "2")).toEqual(users[1])
  expect(find(resource, ["1", "2"])).toEqual(users.slice(0,2))
})

test('not - get entities without ids', () => {
  expect(not(resource, "2")).toEqual([ users[0], users[2] ])
  expect(not(resource, ["1", "2"])).toEqual(users[2])
})

// test('relationship returns all the relationships for a single entity and a resource collection', () => {
// })

test('sort entities', () => {
  expect(sort(resource, (a,b) => a.id == b.id ? 0 : (a.id < b.id ? 1 : -1))).toEqual(users.reverse())
})
