import configureMockStore from 'redux-mock-store'
import { initialResourceState, resourceActions } from '../src'
import users from './fixtures/users'

const mockStore = configureMockStore()
const { fetchStart, fetchSuccess, fetchFailure, resourceReset } = resourceActions("users")
const actionStart    = "USERS/FETCH/START"
const actionSuccess  = "USERS/FETCH/SUCCESS"
const actionFailure  = "USERS/FETCH/FAILURE"
const actionReset    = "USERS/RESOURCE/RESET"

const defaultAction = { error: false, meta: undefined, payload: undefined }

test('CRUD action start', () => {
  const store = mockStore(initialResourceState())
  const expectedActions = [{ ...defaultAction, type: actionStart }]

  store.dispatch(fetchStart())

  expect(store.getActions()).toEqual(expectedActions)
})

test('CRUD action success', () => {
  const store = mockStore(initialResourceState())
  const expectedActions = [{ ...defaultAction, type: actionSuccess, payload: users }]

  store.dispatch(fetchSuccess(users))

  expect(store.getActions()).toEqual(expectedActions)
})

test('CRUD action failure', () => {
  const store = mockStore(initialResourceState())
  const expectedActions = [{ ...defaultAction, type: actionFailure, error: true }]

  store.dispatch(fetchFailure())

  expect(store.getActions()).toEqual(expectedActions)
})

test('Resource reset', () => {
  const store = mockStore({})
  const expectedActions = [{ type: actionReset, payload: undefined, meta: undefined, error: false }]
  store.dispatch(resourceReset())
  expect(store.getActions()).toEqual(expectedActions)
})
