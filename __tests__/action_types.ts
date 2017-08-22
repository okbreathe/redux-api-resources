import { resourceActionTypes } from '../src'

test('Generates Action Types for a resource', () => {
  expect(resourceActionTypes("users")).toEqual({
     changesetCreate: 'USERS/CHANGESET/CREATE',
     changesetUpdate: 'USERS/CHANGESET/UPDATE',
    changesetDestroy: 'USERS/CHANGESET/DESTROY',
         statusClear: 'USERS/STATUS/CLEAR',
          fetchStart: 'USERS/FETCH/START',
        fetchSuccess: 'USERS/FETCH/SUCCESS',
        fetchFailure: 'USERS/FETCH/FAILURE',
         createStart: 'USERS/CREATE/START',
       createSuccess: 'USERS/CREATE/SUCCESS',
       createFailure: 'USERS/CREATE/FAILURE',
         updateStart: 'USERS/UPDATE/START',
       updateSuccess: 'USERS/UPDATE/SUCCESS',
       updateFailure: 'USERS/UPDATE/FAILURE',
        destroyStart: 'USERS/DESTROY/START',
      destroySuccess: 'USERS/DESTROY/SUCCESS',
      destroyFailure: 'USERS/DESTROY/FAILURE'
  })
})

test('Generates Non-Standard Action Types', () => {
  const types = resourceActionTypes("users", ['other'])
  expect(types.otherStart).toEqual("USERS/OTHER/START")
  expect(types.otherSuccess).toEqual("USERS/OTHER/SUCCESS")
  expect(types.otherFailure).toEqual("USERS/OTHER/FAILURE")
})
