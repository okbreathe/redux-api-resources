/*eslint-env jest */

import { apiReducer, formActionTypes } from '../../src'

const { init, change, clearForm, clearField } = formActionTypes("users")
const reducer = apiReducer(resource => resource("users")).usersForm

const initAction = (payload, key) => ({ payload, meta: { form: key }, type: init })

test('initializes the form', () => {
  const payload = { foo: 1 }
  const key = 'key'
  const state = reducer({}, initAction(payload, key))
  expect(state).toEqual({ [key]: payload })
})

test('changes fields', () => {
  const payload = { foo: 1 }
  const key = 'key'
  const initialState = reducer({}, initAction(payload, key))
  const state = reducer(initialState, { payload: 2, meta: { form: key, field: 'foo' }, type: change })
  expect(state.key.foo).toEqual(2)
})

test('clears fields', () => {
  const payload = { foo: 1, bar: 1 }
  const key = 'key'
  const initialState = reducer({}, initAction(payload, key))
  const state = reducer(initialState, { meta: { form: key, field: 'foo' }, type: clearField })
  expect(state).toEqual({ [key]: { bar: 1 } })
})

test('clears form', () => {
  const payload = { foo: 1 }
  const key = 'key'
  const initialState = reducer({}, initAction(payload, key))
  const state = reducer(initialState, { meta: { form: key }, type: clearForm })
  expect(state).toEqual({ [key]: {} })
})
