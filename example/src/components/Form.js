import React from "react"
import { Button } from "@blueprintjs/core"

export default (props) => {
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


