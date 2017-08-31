import { resourceActionTypes } from '../src'

test('Generates Action Types for a resource', () => {
  expect(resourceActionTypes("users")).toEqual({
        changesetSet: 'USERS/CHANGESET/SET',
     changesetRemove: 'USERS/CHANGESET/REMOVE',
          fetchStart: 'USERS/FETCH/START',
        fetchSuccess: 'USERS/FETCH/SUCCESS',
        fetchFailure: 'USERS/FETCH/FAILURE',
          fetchClear: 'USERS/FETCH/CLEAR',
         createStart: 'USERS/CREATE/START',
       createSuccess: 'USERS/CREATE/SUCCESS',
       createFailure: 'USERS/CREATE/FAILURE',
         createClear: 'USERS/CREATE/CLEAR',
         updateStart: 'USERS/UPDATE/START',
       updateSuccess: 'USERS/UPDATE/SUCCESS',
       updateFailure: 'USERS/UPDATE/FAILURE',
         updateClear: 'USERS/UPDATE/CLEAR',
        destroyStart: 'USERS/DESTROY/START',
      destroySuccess: 'USERS/DESTROY/SUCCESS',
      destroyFailure: 'USERS/DESTROY/FAILURE',
        destroyClear: 'USERS/DESTROY/CLEAR',
       resourceReset: 'USERS/RESOURCE/RESET'
  })
})

test('Generates Non-Standard Action Types', () => {
  const types = resourceActionTypes("users", ['other'])
  expect(types.otherStart).toEqual("USERS/OTHER/START")
  expect(types.otherSuccess).toEqual("USERS/OTHER/SUCCESS")
  expect(types.otherFailure).toEqual("USERS/OTHER/FAILURE")
})
