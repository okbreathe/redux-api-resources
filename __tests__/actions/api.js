/*eslint-env jest */

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { Headers, apiActions, actionFor } from '../../src'
import fetchMock from 'fetch-mock'

import users from '../fixtures/users.json'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)
const actions = apiActions(resource => resource("users")).users

afterEach(() => fetchMock.restore())

test('index adds multiple items to store', () => {
  const store = mockStore({})

  fetchMock.get('/users', { body: users, headers: Headers.JSON })

  const expectedActions = [
    { type: actionFor("users", "fetch", "start") },
    { type: actionFor("users", "fetch", "success"), payload: users  }
  ]

  return store.dispatch(actions.index())
    .then(() => expect(store.getActions()).toEqual(expectedActions))
})

test('show adds an item to store', () => {
  const store = mockStore({})

  fetchMock.get('/users/1', { body: users[0], headers: Headers.JSON })

  const expectedActions = [
    { type: actionFor("users", "fetch", "start") },
    { type: actionFor("users", "fetch", "success"), payload: users[0]  }
  ]

  return store.dispatch(actions.show({ id: 1 }))
    .then(() => expect(store.getActions()).toEqual(expectedActions))
})

test('create adds an item to store', () => {
  const store = mockStore({})
  const name = "new_user"
  const id = users.length

  fetchMock.post('/users', { body: {id, name}, headers: Headers.JSON })

  const expectedActions = [
    { type: actionFor("users", "create", "start") },
    { type: actionFor("users", "create", "success"), payload: {id, name}  }
  ]

  return store.dispatch(actions.create({ name }))
    .then(() => expect(store.getActions()).toEqual(expectedActions))
})

test('update updates an item in the store', () => {
  const store = mockStore({})
  const user = users[0]
  const resp = { name: "changed", id: user.id }

  fetchMock.put(`/users/${user.id}`, { body: resp, headers: Headers.JSON })

  const expectedActions = [
    { type: actionFor("users", "update", "start") },
    { type: actionFor("users", "update", "success"), payload: resp  }
  ]

  return store.dispatch(actions.update({ id: user.id, name: "changed" }))
    .then(() => expect(store.getActions()).toEqual(expectedActions))
})

test('destroy removes an item from the store', () => {
  const store = mockStore({})
  const user = users[0]

  fetchMock.delete(`/users/${user.id}`, { body: {}, headers: Headers.JSON })

  const expectedActions = [
    { type: actionFor("users", "destroy", "start") },
    { type: actionFor("users", "destroy", "success"), payload: { id: user.id } }
  ]

  return store.dispatch(actions.destroy({ id: user.id }))
    .then(() => expect(store.getActions()).toEqual(expectedActions))
})

test('sets an error', () => {
  const store = mockStore({})

  fetchMock.get('/users', { body: { error: "error" }, headers: Headers.JSON, status: 406 })

  const expectedActions = [
    { type: actionFor("users", "fetch", "start") },
    { type: actionFor("users", "fetch", "failure"), payload: { error: "error" }, error: true }
  ]

  return store.dispatch(actions.index())
    .then(() => expect(store.getActions()).toEqual(expectedActions))
})

test('it includes meta when given an object', () => {
  const actions = apiActions(resource => resource("users"), { meta: { foo: 1 } }).users
  const store = mockStore({})

  fetchMock.get('/users', { body: users, headers: Headers.JSON })

  const expectedActions = [
    { type: actionFor("users", "fetch", "start") },
    { type: actionFor("users", "fetch", "success"), payload: users, meta: { foo: 1 }  }
  ]

  return store.dispatch(actions.index())
    .then(() => expect(store.getActions()).toEqual(expectedActions))
})

test('it includes meta when given an function', () => {
  const actions = apiActions(resource => resource("users"), { meta: () => ({ foo: 1 }) }).users
  const store = mockStore({})

  fetchMock.get('/users', { body: users, headers: Headers.JSON })

  const expectedActions = [
    { type: actionFor("users", "fetch", "start") },
    { type: actionFor("users", "fetch", "success"), payload: users, meta: { foo: 1 }  }
  ]

  return store.dispatch(actions.index())
    .then(() => expect(store.getActions()).toEqual(expectedActions))
})

describe('overriding options', () => {
  it("resource options override routeset options", () => {
    const store = mockStore({})
    const resourceOptions = { headers: { ...Headers.JSON, resource: 1 }  },
          resourceMeta = { resource: 1 }
    const actions = apiActions(resource => {
      resource("users", {
        prefix: "/resource",
        domain: "http://resource.com",
        options: resourceOptions,
        meta: resourceMeta
      })
    }, {
      prefix: "/routeset",
      domain: "http://routeset.com",
      options: { headers: { ...Headers.JSON, routeset: 1 }  },
      meta: { routeset: 1 }
    }).users

    const expectedActions = [
      { type: actionFor("users", "fetch", "start") },
      { type: actionFor("users", "fetch", "success"), payload: users, meta: resourceMeta  }
    ]

    fetchMock.get('http://resource.com/resource/users', { body: users, headers: resourceOptions.headers })

    return store.dispatch(actions.index())
      .then(() => expect(store.getActions()).toEqual(expectedActions))
  })

  it("route options override resource options", () => {
    const store = mockStore({})
    const routeOptions = { headers: { ...Headers.JSON, resource: 1 } },
          routeMeta = { route: 1 }
    const actions = apiActions(resource => {
      resource("users", {
        prefix: "/resource",
        domain: "http://resource.com",
        options: { headers: { ...Headers.JSON, resource: 1 }  },
        meta: { resource: 1 },
        routes: {
          index: {
            prefix: "/route",
            domain: "http://route.com",
            options: routeOptions,
            meta: routeMeta,
          }
        }
      })
    }).users

    const expectedActions = [
      { type: actionFor("users", "fetch", "start") },
      { type: actionFor("users", "fetch", "success"), payload: users, meta: routeMeta  }
    ]

    fetchMock.get('http://route.com/route/users', { body: users, headers: routeOptions.headers })

    return store.dispatch(actions.index())
      .then(() => expect(store.getActions()).toEqual(expectedActions))
  })
})

describe('customizing route sets', () => {
  it("allows you to set a path", () => {
    const store = mockStore({})

    const actions = apiActions(resource => {
      resource("users", {
        routes: {
          index: { path: "/route" }
        }
      })
    }).users

    const expectedActions = [
      { type: actionFor("users", "fetch", "start") },
      { type: actionFor("users", "fetch", "success"), payload: users }
    ]

    fetchMock.get('/route', { body: users, headers: { ...Headers.JSON } })

    return store.dispatch(actions.index())
      .then(() => expect(store.getActions()).toEqual(expectedActions))
  })

  it("allows creation of non-REST routes", () => {
    const store = mockStore({})

    const actions = apiActions(resource => {
      resource("users")
        .add('custom', { method: "GET", route: "/path" })
    }).users

    const expectedActions = [
      { type: actionFor("users", "fetch", "start") },
      { type: actionFor("users", "fetch", "success"), payload: users }
    ]

    fetchMock.get('/path', { body: users, headers: { ...Headers.JSON } })

    return store.dispatch(actions.custom())
      .then(() => expect(store.getActions()).toEqual(expectedActions))
  })
})

describe('middleware', () => {
  it("resolve continues the chain", () => {
    let val = 0
    const store = mockStore({})
    const actions = apiActions(resource => resource("users"), {
      middleware: [
        (name, req) => ++val && req.resolve(),
        (name, req) => ++val && req.resolve()
      ]
    }).users

    fetchMock.get('/users', { body: users, headers: Headers.JSON })

    return store.dispatch(actions.index())
      .then(() => expect(val).toEqual(2))
  })

  it("reject halts the chain", () => {
    let val = 0
    const store = mockStore({})
    const actions = apiActions(resource => resource("users"), {
      middleware: [
        (name, req) => ++val && req.reject(),
        (name, req) => ++val && req.resolve()
      ]
    }).users

    fetchMock.get('/users', { body: users, headers: Headers.JSON })

    return store.dispatch(actions.index())
      .then(() => expect(val).toEqual(1))
  })

  it("fetch performs the intended request", () => {})
})
