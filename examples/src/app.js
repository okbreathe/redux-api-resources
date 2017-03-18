import React from "react"
import { bindActionCreators } from "redux"
import { connect }  from 'react-redux'
import { EditableText, Button } from "@blueprintjs/core"
import resourceActions from "./actions/resources"
import { toArray } from '../../src'

const Error = (props) => <div className="error pt-form-helper-text">{props.text}</div>

const Note = (props) => {
  const { errors, form, note: { id, title, content }, onDestroy, onEdit, onCancel, onConfirm } = props
  const field = form.field, enabled = form.state().id == id
  // Because of how Blueprint's EditableText works and because there is only a single
  // shared form instance, we pass in an enabled flag based on whether we're
  // editing the particular note. When a field is disabled the field function
  // just returns an empty object.
  return (
    <div className="pt-card pt-elevation-1">
      <h5>
        <EditableText
          {...field("title", enabled, { defaultValue: null })}
          defaultValue={title}
          onEdit={onEdit}
          onCancel={onCancel}
          onConfirm={onConfirm}
          />
        {errors.title && <Error text={errors.title} />}
      </h5>
      <EditableText
        {...field("content", enabled, { defaultValue: null })}
        multiline
        onEdit={onEdit}
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmOnEnterKey={true}
        defaultValue={content}
        />
      {errors.content && <Error text={errors.content} />}
      <footer>
        <Button iconName="trash" onClick={() => onDestroy(id)} />
      </footer>
    </div>
  )
}

const Form = (props) => {
  const { field, errors, onSubmit } = props
  return (
    <form>
      <label className="pt-label">
        Title
        <div className="pt-input-group">
          <input className="pt-input" type="text" {...field("title")} />
          {errors.title && <Error text={errors.title} />}
        </div>
      </label>
      <label className="pt-label">
        Content
        <div className="pt-input-group">
          <textarea className="pt-input pt-fill" {...field("content")}></textarea>
          {errors.content && <Error text={errors.content} />}
        </div>
      </label>
      <Button onClick={onSubmit} iconName="pt-icon-add" text="Create Note"/>
    </form>
  )
}

class App extends React.Component {
  componentDidMount() {
    // Grab the existing notes from the server
    this.props.actions.index()
    // Populate the create form with an empty object
    this.props.createForm.init()
  }

  onCreate = () => {
    const { actions, createForm } = this.props
    actions.create(createForm.state())
      // If the response was successful clear the form
      .then(resp => resp.success && createForm.clear())
  }

  onUpdate = () => {
    const { actions, updateForm } = this.props
    actions.update(updateForm.state())
      // If the response was successful clear the form
      .then(resp => resp.success && updateForm.clear())
  }

  onDestroy = (id) => this.props.actions.destroy({ id })

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
           onEdit={() => updateForm.init(note)}
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
    const actions = bindActionCreators(resourceActions.notes, dispatch),
    // We want to generate one form for new notes and one form
    // for updating existing notes. The string we pass in is arbitrary
    // and just represents the unique key of the form
          createForm = actions.formFor('create'),
          updateForm = actions.formFor('update')
    return ({ actions, createForm, updateForm })
  }
)(App)
