import React from "react"
import { bindActionCreators } from "redux"
import { connect }  from 'react-redux'
import { Button } from "@blueprintjs/core"
import resourceActions from "./actions/resources"
import { toArray } from '../../src'

const Error = (props) => <div className="error pt-form-helper-text">{props.text}</div>

const Form = (props) => {
  const { title = "", content = "", errors, onSubmit, onEdit, onChange, editing } = props

  return (
    <form>
      <label className="pt-label">
        Title
        <div className="pt-input-group">
          <input className="pt-input" type="text" value={title} onChange={e => onChange(editing, 'title', e)} />
          {errors.title && <Error text={errors.title} />}
        </div>
      </label>
      <label className="pt-label">
        Content
        <div className="pt-input-group">
          <textarea className="pt-input pt-fill" value={content} onChange={e => onChange(editing, 'content', e)} ></textarea>
          {errors.content && <Error text={errors.content} />}
        </div>
      </label>
      <div className="pt-button-group">
        <Button onClick={onSubmit} iconName="pt-icon-add" text={`${editing ? 'Update' : 'Create'} Note`}/>
        { editing &&  <Button iconName="cross" onClick={() => onEdit(null)} />}
      </div>
    </form>
  )
}

const Note = (props) => {
  const { note, errors, onDestroy, onEdit, onSubmit, editing, onChange } = props

  return (
    <div className="pt-card pt-elevation-1">
      {
        editing && editing.id == note.id
          ? <Form errors={errors} title={editing.title} editing={editing} content={editing.content} onEdit={onEdit} onSubmit={onSubmit} onChange={onChange} />
          : <div>
              <h5>{note.title}</h5>
              <p>{note.content}</p>
              <footer>
                <div className="pt-button-group">
                  <Button iconName="trash" onClick={() => onDestroy(note)} />
                  <Button iconName="edit" onClick={() => onEdit(note)} />
                </div>
              </footer>
            </div>
      }
    </div>
  )
}

class App extends React.Component {
  state = {
    editing: null,
    new: { title: '', content: '' },
    errors: { new: {}, edit: {} }
  }

  componentDidMount() {
    this.props.actions.index()
  }

  onCreate = () => {
    this.props.actions.create(this.state.new)
      .then(res => res.success
            ? this.setState({ new: { title: '', content: '' } })
            : this.setError('new', res.payload))
  }

  onUpdate = (note) => {
    this.props.actions.update(note)
      .then(res => res.success
            ? this.setState({ editing: null })
            : this.setError('edit', res.payload))
  }

  onDestroy = ({ id }) => this.props.actions.destroy({ id })

  onEdit = (note) => this.setState({ editing: note })

  onChange = (editing, key, e) => {
    const which = editing ? 'editing' : 'new',
          obj = this.state[which]
    obj[key] = e.target.value
    this.setState({ [which]: obj })
  }

  setError = (which, errors) => {
    this.setState({ errors: { [which]: errors } })
  }

  render(){
    const { notes } = this.props

    return (
     <div id='notes'>
       <h1>My Notes</h1>
       <Form errors={this.state.errors.new}
             onSubmit={this.onCreate}
             title={this.state.new.title}
             content={this.state.new.content}
             onChange={this.onChange}
             />
       {notes.map(note =>
          <Note key={note.id}
                errors={this.state.errors.edit}
                note={note}
                onEdit={this.onEdit}
                editing={this.state.editing}
                onSubmit={this.onUpdate}
                onDestroy={this.onDestroy}
                onChange={this.onChange} />)
       }
     </div>
    )
  }
}

export default connect(
   state => ({ notes: toArray(state.notes).reverse() }),
   dispatch => ({ actions: bindActionCreators(resourceActions.notes, dispatch) })
)(App)
