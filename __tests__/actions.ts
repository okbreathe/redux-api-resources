import { resourceActions } from '../src'


type Action = (payload: any, meta: any) => { type: string, payload: any, meta: any, error: boolean }

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

