/*eslint-env jest */
import { apiReducer, initialResourceState, actionFor } from '../../src'
import users from '../fixtures/users.json'

const reducer = apiReducer(resource => resource("users")).users
const fetchType = actionFor("users")

test('adds multiple items to store', () => {
  const state = reducer(initialResourceState(), { payload: users, type: fetchType })

  expect(state.entities).toEqual(users.reduce((acc, u) => { acc[u.id] = u; return acc }, {}))
  expect(state.results).toEqual(users.map(u => u.id))
  expect(state.status.fetch.payload).toEqual(users)
  expect(state.status.fetch.pendingUpdate).toEqual(false)
  expect(state.status.fetch.success).toEqual(true)
})

test('adds a single item to store', () => {
  const user = users[0]
  const state = reducer(initialResourceState(), { payload: user, type: fetchType })

  expect(state.entities).toEqual({ [user.id]: user })
  expect(state.results).toEqual([user.id])
  expect(state.status.fetch.payload).toEqual(user)
  expect(state.status.fetch.pendingUpdate).toEqual(false)
  expect(state.status.fetch.success).toEqual(true)
})

test('does not add an existing item to store', () => {
  const user = users[0]
  const initialState = reducer(initialResourceState(), { payload: user, type: fetchType })
  const state = reducer(initialState, { payload: user, type: fetchType })

  expect(state.entities).toEqual({ [user.id]: user })
  expect(state.results).toEqual([user.id])
  expect(state.status.fetch.payload).toEqual(user)
  expect(state.status.fetch.pendingUpdate).toEqual(false)
  expect(state.status.fetch.success).toEqual(true)
})

test('adds new items to store', () => {
  const testUsers = users.slice(0,2)
  const user = users[0]
  const payload = users[1]
  const initialState = reducer(initialResourceState(), { payload: user, type: fetchType })
  const state = reducer(initialState, { payload, type: actionFor("users", "create") })

  expect(state.entities).toEqual(testUsers.reduce((acc, u) => { acc[u.id] = u; return acc }, {}))
  expect(state.results).toEqual(testUsers.map(u => u.id))
  expect(state.status.create.payload).toEqual(payload)
  expect(state.status.create.pendingUpdate).toEqual(false)
  expect(state.status.create.success).toEqual(true)
})

test('updates an existing item in the store', () => {
  const user = users[0]
  const payload = { id: user.id, name: "CHANGED", email: "user@example.com" }
  const initialState = reducer(initialResourceState(), { payload: user, type: fetchType })
  const state = reducer(initialState, { payload, type: actionFor("users", "update")  })

  expect(state.entities[user.id]).toEqual({ ...user, ...payload })
  expect(state.results[0]).toEqual(user.id)
  expect(state.status.update.payload).toEqual(payload)
  expect(state.status.update.pendingUpdate).toEqual(false)
  expect(state.status.update.success).toEqual(true)
})

test('remove an item from the store', () => {
  const payload = { id: 1 }
  const initialState = reducer(initialResourceState(), { payload: users, type: fetchType })
  const state = reducer(initialState, { payload, type: actionFor("users", "destroy")  })

  expect(state.entities["1"]).toBeUndefined()
  expect(state.results).not.toContain("1")
  expect(state.status.destroy.payload).toEqual(payload)
  expect(state.status.destroy.pendingUpdate).toEqual(false)
  expect(state.status.destroy.success).toEqual(true)
})

