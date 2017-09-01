import { Headers, apiActions } from '../../../src'

export default apiActions(resource => {
  resource("notes")
}, {
  options: { headers: { ...Headers.JSON } }
})
