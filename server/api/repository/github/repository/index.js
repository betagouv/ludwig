'use strict'

const express = require('express')
const router = express.Router({ mergeParams: true })

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')

router.get('/', (req, res) => {
  res.json({
    owner: req.params.owner,
    repo: req.params.repo
  })
})

function ensureDirectoryExists (fullPath) {
  return fs.mkdirAsync(fullPath)
    .then(() => fullPath)
    .catch((err) => {
      if (err.code === 'EEXIST') {
        return fullPath
      }
      throw err
    })
}

function ensureParentDirectoryExists (repository) {
  return ensureDirectoryExists('/tmp/ludwig')
    .then((parentFullPath) => ensureDirectoryExists(path.join(parentFullPath, repository.provider)))
    .then((parentFullPath) => ensureDirectoryExists(path.join(parentFullPath, repository.owner)))
    .then(() => repository)
}

router.get('/refresh', (req, res) => {
  const start = new Date()
  ensureParentDirectoryExists({
    provider: 'github',
    owner: req.params.owner,
    repo: req.params.repo
  })
    .then(repo => {
      res.json({
        refresh: (new Date()).getTime() - start.getTime(),
        repo: repo
      })
    })
})

module.exports = router
