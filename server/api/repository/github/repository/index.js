'use strict'

const express = require('express')
const router = express.Router({ mergeParams: true })

const path = require('path')

const auth = require('../../../../auth/auth.service')
const Repository = require('./repository.model')

function manageError (res, err) {
  res.status(500).json({
    message: err.message,
    stack: err.stack
  })
}

router.use((req, res, next) => {
  const id = `github/${req.params.owner}/${req.params.repo}`
  Repository
    .findById(id)
    .exec()
    .then(repository => {
      req.repository = repository || new Repository({ _id: id })
      next()
    })
    .catch(() => {
      res.sendStatus(500)
    })
})

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

router.get('/', (req, res) => {
  res.json({ id: req.repository.id })
})

router.post('/', auth.isAuthenticated(), (req, res) => {
  req.repository.save()
    .then(() => req.repository.getRepository())
    .then(repository => {
      res.json({
        id: repository.id
      })
    })
    .catch((err) => manageError(res, err))
})

router.get('/tests', (req, res) => {
  res.sendFile(path.join(req.repository.root, 'tests.json'))
})

router.get('/refresh', (req, res) => {
  const start = new Date()
  req.repository.refresh()
    .then(repo => {
      res.json({
        refresh: (new Date()).getTime() - start.getTime(),
        repository: repo.id
      })
    })
    .catch((err) => manageError(res, err))
})

router.post('/suggest', (req, res) => {
  const suggestion = {
    title: req.body.title,
    body: req.body.body,
    content: req.body.content
  }

  if (typeof suggestion.title === 'undefined' ||
    typeof suggestion.body === 'undefined' ||
    typeof suggestion.content === 'undefined') {
    return res.status(400).json({
      message: Object.keys(suggestion).join(', ') + ' are all required.',
      payload: req.body
    })
  }
  const timestamp = (new Date()).getTime()
  suggestion.headName = `ludwig_${timestamp}`
  suggestion.filePath = path.join(req.repository.testDirectory, `ludwig_test_${timestamp}.yaml`)

  req.repository.suggest(suggestion)
    .then(data => {
      res.json({
        push: (new Date()).getTime() - timestamp,
        data: data
      })
    })
    .catch((err) => manageError(res, err))
})

module.exports = router
