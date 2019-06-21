'use strict'

var cors = require('cors')
const express = require('express')
const router = express.Router({ mergeParams: true })

const path = require('path')

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
      if (!repository) {
        return res.status(500).json({
          message: id + ' is not active. Contributions are not possible. Log in to activate and aloow contributions.'
        })
      }

      req.repository = repository
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

function getPath (req, timestamp) {
  if (req.path) {
    const normalizedPath = path.normalize(req.path)
    if (!path.isAbsolute(normalizedPath) && !normalizedPath.startsWith('..')) {
      return normalizedPath
    }
  }
  return path.join(req.repository.testDirectory, `ludwig_test_${timestamp}.yaml`)
}

router.options('/suggest', cors())
router.post('/suggest', cors({ origin: '*' }), (req, res) => {
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
  suggestion.headName = req.body.branch ? `${req.body.branch}_${timestamp}` : `ludwig_${timestamp}`
  suggestion.filePath = getPath(req, timestamp)

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
