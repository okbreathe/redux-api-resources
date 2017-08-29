import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { resourceActions } from '../src'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)
const { resourceForm } = resourceActions("users")
const unboundActions = resourceForm()
const formKey = 'my_key'
const actionSet = "USERS/CHANGESET/SET"
const actionRemove = "USERS/CHANGESET/REMOVE"

test('you can modify the form key', () => {
  const store = mockStore({})
  const actions = resourceForm(formKey)(store.dispatch, store.getState)
  const data1 = { foo: 1, bar: 2 }
  const expectedActions = [
    { type: actionSet, payload: data1, meta: { form: formKey }, error: false }
  ]

  actions.set(data1)

  expect(store.getActions()).toEqual(expectedActions)
})

test('you can modify the changeset', () => {
  const store = mockStore({})
  const actions = unboundActions(store.dispatch, store.getState)
  const data1 = { foo: 1, bar: 2 }
  const data2 = { foo: 2, bar: 3 }
  const expectedActions = [
    { type: actionSet, payload: data1, meta: { form: 'default' }, error: false },
    { type: actionSet, payload: data2, meta: { form: 'default' }, error: false }
  ]

  actions.set(data1)
  actions.set(data2)

  expect(store.getActions()).toEqual(expectedActions)
})

test('clears fields', () => {
  const store = mockStore({})
  const actions = unboundActions(store.dispatch, store.getState)
  const data = { foo: 1, bar: 2 }
  const expectedActions = [
    { payload: data, type: actionSet, meta: { form: 'default' }, error: false },
    { payload: ['foo'], type: actionRemove, meta: { form: 'default' }, error: false }
  ]

  actions.set(data)
  actions.remove('foo')

  expect(store.getActions()).toEqual(expectedActions)
})

test('clears form', () => {
  const store = mockStore({})
  const actions = unboundActions(store.dispatch, store.getState)
  const data = { foo: 1, bar: 2 }
  const expectedActions = [
    { payload: data, type: actionSet, meta: { form: 'default' }, error: false },
    { payload: null, type: actionRemove, meta: { form: 'default' }, error: false }
  ]

  actions.set(data)
  actions.clear()

  expect(store.getActions()).toEqual(expectedActions)
})

test('form helper generates a field change action creator', () => {
  const store = mockStore({ users: { changeset: {} } })
  const actions = unboundActions(store.dispatch, store.getState)
  expect(actions.field("name")).toEqual(
    expect.objectContaining({
      name: "name",
      value: "",
      onChange: expect.any(Function),
    })
  )
})

test('field change action creator can change fields', () => {
  const store = mockStore({ users: { changeset: {} } })
  const actions = unboundActions(store.dispatch, store.getState)
  const { onChange } = actions.field("name")
  const expectedAction = { meta: {form: "default"}, payload: { name: "value" }, type: actionSet, error: false }

  expect(store.dispatch(onChange("value"))).toEqual(expectedAction)
})
