import { resourceActionTypes } from '../src'

test('Generates Action Types for a resource', () => {
  expect(resourceActionTypes("users")).toEqual({
      changesetMerge: 'USERS/CHANGESET/MERGE',
     changesetRemove: 'USERS/CHANGESET/REMOVE',
      changesetReset: 'USERS/CHANGESET/RESET',
          fetchStart: 'USERS/FETCH/START',
        fetchSuccess: 'USERS/FETCH/SUCCESS',
        fetchFailure: 'USERS/FETCH/FAILURE',
          fetchReset: 'USERS/FETCH/RESET',
         createStart: 'USERS/CREATE/START',
       createSuccess: 'USERS/CREATE/SUCCESS',
       createFailure: 'USERS/CREATE/FAILURE',
         createReset: 'USERS/CREATE/RESET',
         updateStart: 'USERS/UPDATE/START',
       updateSuccess: 'USERS/UPDATE/SUCCESS',
       updateFailure: 'USERS/UPDATE/FAILURE',
         updateReset: 'USERS/UPDATE/RESET',
        destroyStart: 'USERS/DESTROY/START',
      destroySuccess: 'USERS/DESTROY/SUCCESS',
      destroyFailure: 'USERS/DESTROY/FAILURE',
        destroyReset: 'USERS/DESTROY/RESET',
       resourceReset: 'USERS/RESOURCE/RESET',
           metaReset: 'USERS/META/RESET',
  })
})
