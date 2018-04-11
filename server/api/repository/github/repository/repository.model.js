'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const jsYaml = require('js-yaml')
const path = require('path')
const rp = require('request-promise')

const config = require('../../../../config/environment')

const Git = require('nodegit')

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
  const reference = `origin/${repo.meta.reference}`
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

function pushOptions (user) {
  return {
    callbacks: {
      credentials: () => {
        return Git.Cred.userpassPlaintextNew(user.name, user.token)
      }
    }
  }
}

function commitSignature (user) {
  return Git.Signature.now(user.name, user.name)
}

function suggest (repository, suggestion) {
  const repositoryRoot = `/opt/ludwig/repositories/github/${repository.owner}/${repository.name}/content`
  const fullPath = path.join(repositoryRoot, suggestion.filePath)

  return getRepository(repository)
    .then(repo => {
      return repo.ref.getRemote('origin')
        .then((remote) => repo.ref.fetch(remote))
        .then(() => repo)
    })
    .then(repo => {
      return repo.ref.getHeadCommit()
        .then((head) => repo.ref.createBranch(suggestion.headName, head))
        .then((branchRef) => repo.ref.checkoutRef(branchRef))
        .then(() => repo)
    })
    .then((repo) => {
      return fs.writeFileAsync(fullPath, suggestion.content, 'utf-8')
        .then(() => repo)
    })
    .then(repo => {
      const signature = commitSignature(config.github.user)
      return repo.ref.createCommitOnHead([suggestion.filePath], signature, signature, `${suggestion.title}\n${suggestion.body}`)
        .then(() => repo)
    })
    .then(repo => {
      return repo.ref.getRemote('origin')
        .then((remote) => {
          return repo.ref.getCurrentBranch()
            .then((ref) => {
              return remote.push([ref], pushOptions(repo.meta.user))
                .then(() => {
                  return rp({
                    method: 'POST',
                    uri: `https://api.github.com/repos/${repo.meta.owner}/${repo.meta.name}/pulls`,
                    body: {
                      head: `refs/heads/${suggestion.headName}`,
                      base: repository.reference,
                      title: suggestion.title,
                      body: suggestion.body
                    },
                    headers: {
                      Authorization: `token ${config.github.user.token}`,
                      'User-Agent': config.github.application.userAgent
                    },
                    json: true
                  })
                })
            })
        })
    })
}

exports.getRepository = getRepository
exports.ensureHomeDirectoryExists = ensureHomeDirectoryExists
exports.refresh = refresh
exports.suggest = suggest
