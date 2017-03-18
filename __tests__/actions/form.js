/*eslint-env jest */
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { apiActions, formActionTypes, resourceActionTypes } from '../../src'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)
const { init, change, clearForm, clearField } = formActionTypes("users")
const actions = apiActions(resource => resource("users")).users
const formKey = 'my_key'

test('initializes the form', () => {
  const store = mockStore({})
  const data = { foo: 1, bar: 2 }
  const expectedAction = { type: init, payload: data, meta: { form: 'default' } }

  expect(store.dispatch(actions.initializeForm(data))).toEqual(expectedAction)
})

test('changes fields', () => {
  const store = mockStore({})
  const expectedAction = { type: change, payload: 2, meta: { form: 'default', field: 'foo' } }

  store.dispatch(actions.initializeForm({ foo: 1 }))

  expect(store.dispatch(actions.changeField(2, { field: 'foo' }))).toEqual(expectedAction)
})

test('clears fields', () => {
  const store = mockStore({})
  const expectedAction = { type: clearField, meta: { form: 'default', field: 'foo' } }

  store.dispatch(actions.initializeForm({ foo: 1 }))

  expect(store.dispatch(actions.clearField('foo'))).toEqual(expectedAction)
})

test('clears form', () => {
  const store = mockStore({})
  const expectedAction = { type: clearForm, meta: { form: 'default' } }

  store.dispatch(actions.initializeForm({ foo: 1 }))

  expect(store.dispatch(actions.clearForm())).toEqual(expectedAction)
})

test('generates an form helper', () => {
  const store = mockStore({})
  const form = store.dispatch(actions.formFor(formKey))
  expect(form).toEqual(
    expect.objectContaining({
      init: expect.anything(Function),
      clear: expect.anything(Function),
      errors: expect.anything(Function),
      state: expect.anything(Function),
      field: expect.anything(Function),
    })
  )
})

test('form helper can initialize the form', () => {
  const store = mockStore({})
  const form = store.dispatch(actions.formFor(formKey))
  const data = { foo: 1, bar: 2 }
  const expectedAction = { type: init, payload: data, meta: { form: formKey } }

  expect(store.dispatch(form.init(data))).toEqual(expectedAction)
})

test('form helper can clear fields', () => {
  const store = mockStore({})
  const form = store.dispatch(actions.formFor(formKey))
  const data = { foo: 1, bar: 2 }
  const expectedAction = { type: clearField, meta: { form: formKey, field: 'foo' } }

  store.dispatch(form.init(data))

  expect(store.dispatch(form.clear('foo')[0])).toEqual(expectedAction)
})

test('form helper can clear the form', () => {
  const store = mockStore({})
  const form = store.dispatch(actions.formFor(formKey))
  const data = { foo: 1, bar: 2 }
  const expectedAction = { type: clearForm, meta: { form: formKey } }

  store.dispatch(form.init(data))

  expect(store.dispatch(form.clear())).toEqual(expectedAction)
})

test('form helper can retrieve state of the form', () => {
  const state = { foo: 1, bar: 2 }
  const store = mockStore({ usersForm: { [formKey]: state } })
  const form = store.dispatch(actions.formFor(formKey))
  expect(form.state()).toEqual(state)
})

test('form helper can retrieve form errors', () => {
  const errors = { foo: "cannot be blank" }
  const store = mockStore({ users: { status: { create: { pendingUpdate: false, id: null, success: false, payload: errors, busy: false } } } })
  const form = store.dispatch(actions.formFor(formKey))
  expect(form.errors('create')).toEqual(errors)
})

test('form helper generates a field change action creator', () => {
  const store = mockStore({ usersForm: { formKey: {} } })
  const form = store.dispatch(actions.formFor(formKey))
  expect(form.field("name")).toEqual(
    expect.objectContaining({
      name: expect.anything(String),
      value: expect.anything(String),
      onChange: expect.anything(Function),
    })
  )
})

test('field change action creator can change fields', () => {
  const store = mockStore({ usersForm: { formKey: {} } })
  const form = store.dispatch(actions.formFor(formKey))
  const { onChange } = form.field("name")
  const expectedAction = { meta: {field: "name", form: formKey}, payload: "value", type: change }

  expect(store.dispatch(onChange("value"))).toEqual(expectedAction)
})
