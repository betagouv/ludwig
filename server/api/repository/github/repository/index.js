'use strict'

const express = require('express')
const router = express.Router({ mergeParams: true })

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')

const Git = require('nodegit')

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

function ensureHomeDirectoryExists (repository) {
  return ensureDirectoryExists('/tmp/ludwig')
    .then((parentFullPath) => ensureDirectoryExists(path.join(parentFullPath, repository.provider)))
    .then((parentFullPath) => ensureDirectoryExists(path.join(parentFullPath, repository.owner)))
    .then((parentFullPath) => ensureDirectoryExists(path.join(parentFullPath, repository.name)))
}

function getRepositoryURL (repository) {
  return 'https://github.com/' + repository.owner + '/' + repository.name + '.git'
}

function fetchRepo (repo) {
  return repo.fetch('origin', {
    updateFetchhead: 1
  }).then(() => repo)
}

function checkoutMaster (repo) {
  return repo.checkoutBranch('origin/master').then(() => repo)
}

function filter (directory) {
  return Promise.all(fs.readdirAsync(directory)
    .filter((file) => {
      const fullPath = path.join(directory, file)
      return fs.statAsync(fullPath)
        .then((stats) => stats.isFile())
        .catch(() => false)
    })
  )
}

function main (repository) {
  return ensureHomeDirectoryExists(repository)
    .then((repositoryFullPath) => {
      const fullPath = path.join(repositoryFullPath, 'content')
      return Git.Clone(getRepositoryURL(repository), fullPath)
        .catch((err) => {
          if (err.message.match(/exists and is not an empty directory/)) {
            return Git.Repository.open(fullPath)
          }

          throw err
        })
    })
    .then(fetchRepo)
    .then(checkoutMaster)
    .then((ref) => {
      const folder = path.join(ref.workdir(), repository.folder || 'tests')
      const testPath = path.resolve(path.join(ref.workdir(), '../tests.json'))
      return filter(folder)
        .then(JSON.stringify)
        .then((files) => fs.writeFile(testPath, files, { encoding: 'utf-8' }))
        .then(() => ref)
    })
    .then(() => repository)
}

router.use((req, res, next) => {
  const repo = {
    provider: 'github',
    owner: req.params.owner,
    name: req.params.repo
  }
  const id = [repo.provider, repo.owner, repo.name].join('/')
  const repoList = require('../../list')

  var details = repoList.find(function (item) { return item.id === id })
  if (!details) {
    return res.status(404).json(repo)
  }
  req.repository = Object.assign(repo, details)
  next()
})

router.get('/tests', (req, res) => {
  ensureHomeDirectoryExists(req.repository)
    .then((homeDirectory) => res.sendFile(path.join(homeDirectory, 'tests.json')))
})

router.get('/refresh', (req, res) => {
  const start = new Date()
  main(req.repository)
    .then(repo => {
      res.json({
        refresh: (new Date()).getTime() - start.getTime(),
        repository: repo
      })
    })
    .catch(function (err) {
      res.status(500).json(JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))))
    })
})

module.exports = router
