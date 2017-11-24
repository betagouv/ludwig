'use strict'

const express = require('express')
const router = express.Router({ mergeParams: true })

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const jsYaml = require('js-yaml')

const Git = require('nodegit')

function manageDefaultProperties (repo) {
  repo.testDirectory = repo.testDirectory || 'tests'
  repo.reference = repo.reference || 'master'
  return repo
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
  req.repository = manageDefaultProperties(Object.assign(repo, details))
  next()
})

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

router.get('/', (req, res) => {
  res.json(req.repository)
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
  return ensureDirectoryExists('/opt/ludwig')
    .then((parentFullPath) => ensureDirectoryExists(path.join(parentFullPath, 'repositories')))
    .then((parentFullPath) => ensureDirectoryExists(path.join(parentFullPath, repository.provider)))
    .then((parentFullPath) => ensureDirectoryExists(path.join(parentFullPath, repository.owner)))
    .then((parentFullPath) => ensureDirectoryExists(path.join(parentFullPath, repository.name)))
}

function getRepositoryURL (repository) {
  return `https://github.com/${repository.owner}/${repository.name}.git`
}

function checkoutDefaultBranch (repo) {
  const reference = `origin/${repo.meta.reference || 'master'}`
  return repo.ref.getReference(reference)
    .then((ref) => repo.ref.checkoutRef(ref))
    .then(() => repo)
}

function fetchRepo (repo) {
  return repo.ref.fetch('origin', {
    updateFetchhead: 1
  }).then(() => repo)
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

function serialize (testFile) {
  return fs.readFileAsync(testFile.fullPath, { encoding: 'utf-8' })
    .then((content) => {
      const ext = path.extname(testFile.fullPath)
      let result = {
        id: testFile.id
      }
      if (ext === '.yaml') {
        result.data = jsYaml.safeLoad(content)
      } else {
        result.content = content
      }
      return result
    })
    .catch((err) => {
      err.path = testFile.fullPath
      throw err
    })
}

function processTestFiles (repository) {
  const ref = repository.ref
  const testDirectory = path.join(ref.workdir(), repository.meta.testDirectory)
  const testPath = path.resolve(path.join(ref.workdir(), '../tests.json'))
  return filter(testDirectory)
    .then((files) => {
      return Promise.map(files, (file) => {
        return {
          id: file,
          fullPath: path.join(testDirectory, file)
        }
      }).map(serialize)
    })
    .then(JSON.stringify)
    .then((files) => fs.writeFile(testPath, files, { encoding: 'utf-8' }))
    .then(() => repository)
}

function getRepository (repository) {
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
        .then((repoRef) => {
          return { meta: repository, ref: repoRef }
        })
    })
    .then(fetchRepo)
    .then(checkoutDefaultBranch)
}

function refresh (repository) {
  return getRepository(repository)
    .then(processTestFiles)
}

router.get('/tests', (req, res) => {
  ensureHomeDirectoryExists(req.repository)
    .then((homeDirectory) => res.sendFile(path.join(homeDirectory, 'tests.json')))
})

router.get('/refresh', (req, res) => {
  const start = new Date()
  refresh(req.repository)
    .then(repo => {
      res.json({
        refresh: (new Date()).getTime() - start.getTime(),
        repository: repo
      })
    })
    .catch((err) => {
      res.status(500).json(JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))))
    })
})

module.exports = router
