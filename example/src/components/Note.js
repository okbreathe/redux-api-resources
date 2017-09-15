import React from "react"
import { Button, EditableText } from "@blueprintjs/core"

import Error from './Error'

export default (props) => {
  const { errors, form, note: { id, title, content }, onDestroy, onEdit, onCancel, onConfirm } = props
  const field = form.field, disabled = form.changeset().id != id
  // Because of how Blueprint's EditableText works and because there is only a
  // single shared form instance, we pass in an disabled flag based on whether
  // we're editing the particular note. When a field is disabled the field
  // function just returns an empty object.
  return (
    <div className="pt-card pt-elevation-1">
      <h5>
        <EditableText
          {...field("title", { defaultValue: null, disabled })}
          defaultValue={title}
          onEdit={onEdit}
          onCancel={onCancel}
          onConfirm={onConfirm}
          />
        {(!disabled && errors.title) && <Error text={errors.title} />}
      </h5>
      <EditableText
        {...field("content", { defaultValue: null, disabled })}
        multiline
        onEdit={onEdit}
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmOnEnterKey={true}
        defaultValue={content}
        />
      {(!disabled && errors.content) && <Error text={errors.content} />}
      <footer>
        <Button iconName="trash" onClick={() => onDestroy(id)} />
      </footer>
    </div>
  )
}
