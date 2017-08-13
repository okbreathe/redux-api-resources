import * as request from 'superagent'

export default {
  index: () => {
    return request
      .get("http://localhost:3000/notes")
      .set('Accept', 'application/json')
      .send()
  },

  create: (data) => {
    return request
    .post("http://localhost:3000/notes")
    .set('Accept', 'application/json')
    .send(data)
  },

  update: (id, data) => {
    return request
    .put(`http://localhost:3000/notes/${id}`)
    .set('Accept', 'application/json')
    .send(data)
  },

  destroy: (id) => {
    return request
    .delete(`http://localhost:3000/notes/${id}`)
    .set('Accept', 'application/json')
    .send()
  },
}
