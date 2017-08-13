import { createStore, applyMiddleware, combineReducers } from "redux"
import { createResource } from "redux-api-resources"
import thunkMiddleware from "redux-thunk"

export const notes = createResource("notes")

export default createStore(
  combineReducers({ notes: notes.reducer }),
  applyMiddleware(thunkMiddleware)
)

