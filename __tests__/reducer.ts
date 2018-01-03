import { resourceReducer } from '../src'
import { initialResourceState } from '../src/reducer'
import users, { User } from './fixtures/users'

const fetchSuccess    = "USERS/FETCH/SUCCESS"
const fetchFailure    = "USERS/FETCH/FAILURE"
const fetchReset      = "USERS/FETCH/RESET"
const createSuccess   = "USERS/CREATE/SUCCESS"
const updateSuccess   = "USERS/UPDATE/SUCCESS"
const destroySuccess  = "USERS/DESTROY/SUCCESS"
const resourceReset   = "USERS/RESOURCE/RESET"
const changesetMerge  = "USERS/CHANGESET/MERGE"
const changesetRemove = "USERS/CHANGESET/REMOVE"
const changesetReset  = "USERS/CHANGESET/RESET"
const metaReset       = "USERS/META/RESET"

const reducer = resourceReducer("users")

test('adds multiple items to store', () => {
  const state = reducer(initialResourceState<User>(), { payload: users, type: fetchSuccess })

  expect(state.entities).toEqual(users.reduce((acc: any, u) => { acc[u.id] = u; return acc }, {}))
  expect(state.results).toEqual(users.map((u: any) => u.id))
  expect(state.status.fetch.payload).toEqual(users)
  expect(state.status.fetch.pending).toEqual(false)
  expect(state.status.fetch.success).toEqual(true)
})

test('adds a single item to store', () => {
  const user = users[0]
  const state = reducer(initialResourceState<User>(), { payload: user, type: fetchSuccess })

  expect(state.entities).toEqual({ [user.id]: user })
  expect(state.results).toEqual([user.id])
  expect(state.status.fetch.payload).toEqual(user)
  expect(state.status.fetch.pending).toEqual(false)
  expect(state.status.fetch.success).toEqual(true)
})

test('does not add an existing item to store', () => {
  const user = users[0]
  const initialState = reducer(initialResourceState<User>(), { payload: user, type: fetchSuccess })
  const state = reducer(initialState, { payload: user, type: fetchSuccess })

  expect(state.entities).toEqual({ [user.id]: user })
  expect(state.results).toEqual([user.id])
  expect(state.status.fetch.payload).toEqual(user)
  expect(state.status.fetch.pending).toEqual(false)
  expect(state.status.fetch.success).toEqual(true)
})

test('adds new items to store', () => {
  const testUsers = users.slice(0,2)
  const user = users[0]
  const payload = users[1]
  const initialState = reducer(initialResourceState<User>(), { payload: user, type: fetchSuccess })
  const state = reducer(initialState, { payload, type: createSuccess })

  expect(state.entities).toEqual(testUsers.reduce((acc: any, u) => { acc[u.id] = u; return acc }, {}))
  expect(state.results).toEqual(testUsers.map((u: any) => u.id))
  expect(state.status.create.payload).toEqual(payload)
  expect(state.status.create.pending).toEqual(false)
  expect(state.status.create.success).toEqual(true)
})

test('updates an existing item in the store', () => {
  const user = users[0]
  const payload = { id: user.id, name: "CHANGED", email: "user@example.com" }
  const initialState = reducer(initialResourceState<User>(), { payload: user, type: fetchSuccess })
  const state = reducer(initialState, { payload, type: updateSuccess  })

  expect(state.entities[user.id]).toEqual({ ...user, ...payload })
  expect(state.results[0]).toEqual(user.id)
  expect(state.status.update.payload).toEqual(payload)
  expect(state.status.update.pending).toEqual(false)
  expect(state.status.update.success).toEqual(true)
})

test('remove an item from the store', () => {
  const payload = { id: "1" }
  const initialState = reducer(initialResourceState<User>(), { payload: users, type: fetchSuccess })
  const state = reducer(initialState, { payload, type: destroySuccess  })

  expect(state.entities["1"]).toBeUndefined()
  expect(state.results).not.toContain("1")
  expect(state.status.destroy.payload).toEqual(payload)
  expect(state.status.destroy.pending).toEqual(false)
  expect(state.status.destroy.success).toEqual(true)
})

test('removes multiple items from the store', () => {
  const payload = ["1", "2", "3", "4", "5"]
  let state = reducer(initialResourceState<User>(), { payload: users, type: fetchSuccess })
  state = reducer(state, { payload, type: destroySuccess  })

  expect(state.entities).toEqual({})
  expect(state.results.length).toEqual(0)
  expect(state.status.destroy.payload).toEqual(payload)
  expect(state.status.destroy.pending).toEqual(false)
  expect(state.status.destroy.success).toEqual(true)
})

test("Sets a resource's meta", () => {
  const meta = { foo: 'bar' }
  const state = reducer(initialResourceState<User>(), { payload: [], type: fetchSuccess, meta })
  expect(state.meta).toEqual(meta)
})

test("Reseting the meta", () => {
  const meta = { foo: 'bar' }
  const actionWithMeta = { payload: [], type: fetchSuccess, meta: meta }
  let state = reducer(initialResourceState<User>(), actionWithMeta)

  state = reducer(state, { payload: {}, meta: {}, type: metaReset })

  expect(state.meta).toEqual({})
})

test("Reset a resource to the inital state", () => {
  let state = reducer(initialResourceState<User>(), { payload: users, type: fetchSuccess })
  expect(state).not.toEqual(initialResourceState())
  state = reducer(state, { payload: null, type: resourceReset })
  expect(state).toEqual(initialResourceState())
})

test('Creating a changeset', () => {
  let state = reducer(initialResourceState<User>(), { payload: {}, type: changesetMerge })
  expect(state.changeset).toEqual({ default: {} })

  state = reducer(initialResourceState<User>(), { payload: { foo: 'bar' }, type: changesetMerge })
  expect(state.changeset).toEqual({ default: { foo: 'bar' } })

  state = reducer(initialResourceState<User>(), { payload: { foo: 'bar' }, meta: { form: 'myForm' }, type: changesetMerge })
  expect(state.changeset).toEqual({ myForm: { foo: 'bar' } })
})

test('Updating a changeset', () => {
  let state = reducer(initialResourceState<User>(), { payload: {foo: 'bar'}, type: changesetMerge })
  state = reducer(state, { payload: { foo: 'quux' }, type: changesetMerge })
  expect(state.changeset).toEqual({ default: { foo: 'quux' } })

  state = reducer(initialResourceState<User>(), { payload: {foo: 'bar'}, type: changesetMerge })
  state = reducer(state, { payload: { bar: 'quux' }, type: changesetMerge })
  expect(state.changeset).toEqual({ default: { foo: 'bar', bar: 'quux' } })
})

test('Reseting a changeset', () => {
  let state = reducer(initialResourceState<User>(), { payload: { foo: 'bar', baz: 'quux' }, type: changesetMerge })
  state = reducer(state, { payload: {}, type: changesetReset })
  expect(state.changeset).toEqual({ default: {} })
})

test('Removing a changeset field', () => {
  let state = reducer(initialResourceState<User>(), { payload: { foo: 'bar', baz: 'quux' }, type: changesetMerge })
  state = reducer(state, { payload: ['foo'], type: changesetRemove })
  expect(state.changeset).toEqual({ default: { baz: 'quux' } })
})

test("Reseting the status", () => {
  const error = { error: "Error message" }
  let state = reducer(initialResourceState<User>(), { payload: error, type: fetchFailure  })
  expect(state.status.fetch).toEqual({
    pending: true,
    busy: false,
    success: false,
    payload: error
  })
  state = reducer(state, { payload: {}, type: fetchReset })
  expect(state.status.fetch).toEqual({ pending: null, id: null, success: null, payload: null, busy: false })
})
