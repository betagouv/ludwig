'use strict'

const express = require('express')
const router = express.Router({ mergeParams: true })

const path = require('path')

const auth = require('../../../../auth/auth.service')
const config = require('../../../../config/environment')
const repoList = config.alpha.repositoryList

const model = require('./repository.model')

function manageDefaultProperties (repo) {
  repo.testDirectory = repo.testDirectory || 'tests'
  repo.reference = repo.reference || 'master'
  return repo
}

function manageError (res, err) {
  res.status(500).json({
    message: err.message,
    stack: err.stack
  })
}

router.use((req, res, next) => {
  const repo = {
    provider: 'github',
    owner: req.params.owner,
    name: req.params.repo
  }
  const id = [repo.provider, repo.owner, repo.name].join('/')

  var details = repoList.find(function (item) { return item.id === id })
  if (!details) {
    return res.status(404).json(repo)
  }
  req.repository = manageDefaultProperties(Object.assign(repo, details))
  next()
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
  model.getRepository(req.repository)
})

router.get('/tests', (req, res) => {
  model.ensureHomeDirectoryExists(req.repository)
    .then((homeDirectory) => res.sendFile(path.join(homeDirectory, 'tests.json')))
})

router.get('/refresh', (req, res) => {
  const start = new Date()
  model.refresh(req.repository)
    .then(repo => {
      res.json({
        refresh: (new Date()).getTime() - start.getTime(),
        repository: repo.meta.id
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

  model.suggest(req.repository, suggestion)
    .then(data => {
      res.json({
        push: (new Date()).getTime() - timestamp,
        data: data
      })
    })
    .catch((err) => manageError(res, err))
})

module.exports = router
