import { resourceReducer, formReducer } from './'

class Resource {
  constructor(config){
    this._reducers = {}
    this.globalConfig = config
  }

  reducer = (name, resourceConfig = {}) => {
    const config = { ...this.globalConfig, ...resourceConfig }
    this._reducers[name] = resourceReducer(name, config)
    if (!config.readonly) this._reducers[`${name}Form`] = formReducer(name, config)
  }

  get reducers() {
    return this._reducers
  }
}

export const apiReducer = (fn, config = {}) => {
  const resource = new Resource(config)
  fn(resource.reducer)
  return resource.reducers
}
