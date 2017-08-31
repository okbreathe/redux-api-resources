import {
  forEach,
  filter,
  first,
  get,
  last,
  map,
  not,
  reduce,
  sort,
  toArray,
} from '../src'

import usersData, { User } from './fixtures/users'

const users = usersData.slice(0,3)

const resource = {
  results: users.map(u => u.id),
  entities: users.reduce((acc: any, u) => { acc[u.id] = u; return acc }, {}),
  meta: {},
  changeset: {},
  status: {
    fetch: { pending: null, id: null, success: null, payload: null, busy: false },
    create: { pending: null, id: null, success: null, payload: null, busy: false },
    update: { pending: null, id: null, success: null, payload: null, busy: false },
    destroy: { pending: null, id: null, success: null, payload: null, busy: false }
  }
}

test('each iterates over entities in order', () => {
  const arr: number[] = []
  forEach<User>(resource, u => arr.push(parseInt(u.id)))
  expect(arr).toEqual([1,2,3])
})

test('map entities', () => {
  expect(map<User>(resource, u => u.id)).toEqual(["1", "2", "3"])
})

test('toArray converts entities into a plain array', () => {
  expect(toArray(resource)).toEqual(users)
})

test('filter entities', () => {
  expect(filter<User>(resource, u => u.id == "1")).toEqual([users[0]])
})

test('reduce entities into a new value', () => {
  expect(reduce<User>(resource, ((acc: number, u: User) => acc + parseInt(u.id)), 0)).toEqual(6)
})

test('first - return returns the first entity for its predicate', () => {
  expect(first(resource)).toEqual(users[0])
  expect(first(resource, u => u.id == "2")).toEqual(users[1])
})

test('last - return returns the last entity for its predicate', () => {
  expect(last(resource)).toEqual(users[2])
  expect(last(resource, u => u.id == "3")).toEqual(users[2])
})

test('get - get entities with given ids', () => {
  expect(get(resource, "2")).toEqual(users.slice(1,2))
  expect(get(resource, ["1", "2"])).toEqual(users.slice(0,2))
})

test('not - get entities without ids', () => {
  expect(not(resource, "2")).toEqual([ users[0], users[2] ])
  expect(not(resource, ["1", "2"])).toEqual(users.slice(2,3))
})

test('sort entities', () => {
  expect(sort<User>(resource, (a, b) => a.id == b.id ? 0 : (a.id < b.id ? 1 : -1))).toEqual(users.reverse())
})
