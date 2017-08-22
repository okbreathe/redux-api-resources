declare var require: any

import { resourceReducer } from '../src'
import { initialResourceState } from '../src/reducer'

interface User {
  id: string
  name: string
}

const users: User[] = require('./fixtures/users.json')
const actionFetch   = "USERS/FETCH/SUCCESS"
const actionCreate  = "USERS/CREATE/SUCCESS"
const actionUpdate  = "USERS/UPDATE/SUCCESS"
const actionDestroy = "USERS/DESTROY/SUCCESS"

const reducer = resourceReducer("users")

// test that id can be number

test('adds multiple items to store', () => {
  const state = reducer(initialResourceState<User>(), { payload: users, type: actionFetch })

  expect(state.entities).toEqual(users.reduce((acc: any, u) => { acc[u.id] = u; return acc }, {}))
  expect(state.results).toEqual(users.map((u: any) => u.id))
  // expect(state.status.fetch.payload).toEqual(users)
  expect(state.status.fetch.pending).toEqual(false)
  expect(state.status.fetch.success).toEqual(true)
})

test('adds a single item to store', () => {
  const user = users[0]
  const state = reducer(initialResourceState<User>(), { payload: user, type: actionFetch })

  expect(state.entities).toEqual({ [user.id]: user })
  expect(state.results).toEqual([user.id])
  // expect(state.status.fetch.payload).toEqual(user)
  expect(state.status.fetch.pending).toEqual(false)
  expect(state.status.fetch.success).toEqual(true)
})

// Should be optional alwaysRefresh, takeLatest, takeEvery
test('does not add an existing item to store', () => {
  const user = users[0]
  const initialState = reducer(initialResourceState<User>(), { payload: user, type: actionFetch })
  const state = reducer(initialState, { payload: user, type: actionFetch })

  expect(state.entities).toEqual({ [user.id]: user })
  expect(state.results).toEqual([user.id])
  // expect(state.status.fetch.payload).toEqual(user)
  expect(state.status.fetch.pending).toEqual(false)
  expect(state.status.fetch.success).toEqual(true)
})

test('adds new items to store', () => {
  const testUsers = users.slice(0,2)
  const user = users[0]
  const payload = users[1]
  const initialState = reducer(initialResourceState<User>(), { payload: user, type: actionFetch })
  const state = reducer(initialState, { payload, type: actionCreate })

  expect(state.entities).toEqual(testUsers.reduce((acc: any, u) => { acc[u.id] = u; return acc }, {}))
  expect(state.results).toEqual(testUsers.map((u: any) => u.id))
  // expect(state.status.create.payload).toEqual(payload)
  expect(state.status.create.pending).toEqual(false)
  expect(state.status.create.success).toEqual(true)
})

test('updates an existing item in the store', () => {
  const user = users[0]
  const payload = { id: user.id, name: "CHANGED", email: "user@example.com" }
  const initialState = reducer(initialResourceState<User>(), { payload: user, type: actionFetch })
  const state = reducer(initialState, { payload, type: actionUpdate  })

  expect(state.entities[user.id]).toEqual({ ...user, ...payload })
  expect(state.results[0]).toEqual(user.id)
  // expect(state.status.update.payload).toEqual(payload)
  expect(state.status.update.pending).toEqual(false)
  expect(state.status.update.success).toEqual(true)
})

test('remove an item from the store', () => {
  const payload = { id: 1 }
  const initialState = reducer(initialResourceState<User>(), { payload: users, type: actionFetch })
  const state = reducer(initialState, { payload, type: actionDestroy  })

  expect(state.entities["1"]).toBeUndefined()
  expect(state.results).not.toContain("1")
  // expect(state.status.destroy.payload).toEqual(payload)
  expect(state.status.destroy.pending).toEqual(false)
  expect(state.status.destroy.success).toEqual(true)
})

test('removes multiple items from the store', () => {
})
