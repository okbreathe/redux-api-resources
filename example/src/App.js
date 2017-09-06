import React from "react"
import { bindActionCreators } from "redux"
import { connect }  from 'react-redux'
import { notes } from "./store"
import { toArray } from '../../../dist'

import api from './api'
import Error from './components/Error'
import Form from './components/Form'
import Note from './components/Note'

class App extends React.Component {
  componentDidMount() {
    const { fetchStart, fetchFailure, fetchSuccess } = this.props.actions
    // Grab the existing notes from the server
    fetchStart()
    try {
      api.index().then(data => fetchSuccess(data.body))
    } catch(e) {
      fetchFailure(e.message)
    }
  }

  onCreate = () => {
    const { actions: { createStart, createSuccess }, createForm } = this.props
    createStart()
    api.create(createForm.changeset())
      .then(data => createSuccess(data.body) && createForm.reset())
  }

  onUpdate = () => {
    const { actions: { updateStart, updateSuccess }, updateForm } = this.props
    updateStart()
    api.update(updateForm.changeset().id, updateForm.changeset())
      .then(data => updateSuccess(data.body) && updateForm.reset())
  }

  onDestroy = (id) => {
    const { destroyStart, destroySuccess } = this.props.actions
    destroyStart()
    api.destroy(id)
      .then(data => destroySuccess(id))
  }

  render(){
    const { notes, createForm, updateForm } = this.props

    return (
     <div id='notes'>
       <Form onSubmit={this.onCreate} field={createForm.field} errors={createForm.errors('create')} />
       {notes.map(note =>
         <Note
           key={note.id}
           note={note}
           form={updateForm}
           errors={updateForm.errors('update')}
           onConfirm={this.onUpdate}
           onDestroy={this.onDestroy}
           onEdit={() => updateForm.set(note)}
           onCancel={updateForm.clear}
           />)}
     </div>
    )
  }
}

export default connect(
  // Objects in the store are NOT stored as simply arrays, so it is necessary
  // to flatten them into a normal array when working with them
  state => ({ notes: toArray(state.notes).reverse() }),
  dispatch => {
    const actions = bindActionCreators(notes.actions, dispatch)
    // We want to generate one form for new notes and one form
    // for updating existing notes. The string we pass in is arbitrary
    // and just represents the unique key of the form
    const createForm = actions.resourceForm('create')
    const updateForm = actions.resourceForm('update')
    return ({ actions, createForm, updateForm })
  }
)(App)
