const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const webpack = require('webpack')
const webpackMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const config = require('./webpack.config.js')
const port = 3000
const app = express()
const notes = require(path.join(__dirname+'/views/notes.json'))

const compiler = webpack(config)
const middleware = webpackMiddleware(compiler, {
  publicPath: config.output.publicPath,
  contentBase: 'src',
  stats: {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false
  }
})

app.use(bodyParser.json())
app.use(middleware)
app.use(webpackHotMiddleware(compiler))

app.get('/', function response(req, res) {
  res.sendFile(path.join(__dirname+'/views/index.html'))
})

app.get('/notes', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json(notes)
})

app.post('/notes', function (req, res) {
  const errors = hasErrors(req.body)
  if (errors)  return handleError(res, errors)

  const note = req.body
  note.id = notes.length + 1
  notes.push(note)
  res.json(note)

  console.info('==> Created note: {id: %s, title: %s, content: %s}', note.id, note.title, note.content)
})

app.put('/notes/:id', function (req, res) {
  const errors = hasErrors(req.body)
  if (errors)  return handleError(res, errors)

  const idx = notes.indexOf(req.params.id)
  const note = Object.assign({}, notes[idx], req.body)
  notes[idx] = note
  res.json(note)

  console.info('==> Updated note: {id: %s, title: %s, content: %s}', note.id, note.title, note.content)
})

app.delete('/notes/:id', function (req, res) {
  const id = parseInt(req.params.id)
  const note = notes.find(n => n.id == id)

  notes.splice(notes.indexOf(note), 1)
  res.send('')

  console.info('==> Deleted note: {id: %s, title: %s, content: %s}', note.id, note.title, note.content)
})

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) console.log(err)
  console.info('==> Listening on port %s. Open up http://0.0.0.0:%s/ in your bowser.', port, port)
})

function hasErrors(note) {
  const err = {}
  if (!note.title || note.title == "") err.title = "Must have a title"
  if (!note.content || note.content == "") err.content = "Must have content"
  return Object.keys(err).length ? err : null
}

function handleError(res,err){
  res.status(406).json(err)
}
