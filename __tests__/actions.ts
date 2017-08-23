import { resourceActions } from '../src'


type Action = (payload: any, meta: any) => { type: string, payload: any, meta: any, error: boolean }

const actions = resourceActions("users")

test('Generates Action for a resource', () => {
  // expect(resourceActions("users")).toEqual({
  //    changesetCreate: function(){},
  //    changesetUpdate: function(){},
  //   changesetDestroy: function(){},
  //        statusClear: function(){},
  //         fetchStart: function(){},
  //       fetchSuccess: function(){},
  //       fetchFailure: function(){},
  //        createStart: function(){},
  //      createSuccess: function(){},
  //      createFailure: function(){},
  //        updateStart: function(){},
  //      updateSuccess: function(){},
  //      updateFailure: function(){},
  //       destroyStart: function(){},
  //     destroySuccess: function(){},
  //     destroyFailure: function(){},
  // })
})


test('Creating a changeset', () => {
  actions.changesetCreate()
})

test('Updating a changeset', () => {
  actions.changesetUpdate()
})

test('Destroying a changeset', () => {
  actions.changesetDestroy()
})

test('Destroying a changeset field', () => {
  actions.changesetDestroy()
})
