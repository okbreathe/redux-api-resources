import React from "react"
import { EditableText } from "@blueprintjs/core"

export default (props) => {
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


