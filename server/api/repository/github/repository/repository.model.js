'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const Git = require('nodegit')
const jsYaml = require('js-yaml')
const mkdirp = Promise.promisifyAll(require('mkdirp'))
const mongoose = require('mongoose')
const path = require('path')
const rp = require('request-promise')

const config = require('../../../../config/environment')

var RepositorySchema = new mongoose.Schema({
  _id: String,
  testDirectory: {
    type: String,
    default: 'tests'
  },
  reference: {
    type: String,
    default: 'master'
  },
  user: {
    name: {
      type: String,
      default: 'ludwig-test'
    },
    token: {
      type: String,
      default: process.env.GITHUB_PUSH_TOKEN
    }
  }
})

RepositorySchema.virtual('provider')
  .get(function () {
    return this._id.split('/')[0]
  })

RepositorySchema.virtual('owner')
  .get(function () {
    return this._id.split('/')[1]
  })

RepositorySchema.virtual('name')
  .get(function () {
    return this._id.split('/')[2]
  })

RepositorySchema.virtual('root')
  .get(function () {
    return `/opt/ludwig/repositories/github/${this.owner}/${this.name}`
  })

RepositorySchema.virtual('content')
  .get(function () {
    return `${this.root}/content`
  })

RepositorySchema.virtual('URL')
  .get(function () {
    return `https://github.com/${this.owner}/${this.name}.git`
  })

function checkoutDefaultBranch (repo) {
  const reference = `origin/${repo.reference}`
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
  const testDirectory = path.join(ref.workdir(), repository.testDirectory)
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

RepositorySchema.methods = {
  getRepository: function () {
    return mkdirp.mkdirpAsync(this.root)
      .then(() => {
        return Git.Clone(this.URL, this.content)
          .catch((err) => {
            if (err.message.match(/exists and is not an empty directory/)) {
              return Git.Repository.open(this.content)
            }

            throw err
          })
          .then((repoRef) => {
            this.ref = repoRef
            return this
          })
      })
      .then(fetchRepo)
      .then(checkoutDefaultBranch)
  },

  refresh: function () {
    return this.getRepository()
      .then(processTestFiles)
  },

  suggest: function (suggestion) {
    const repositoryRoot = `/opt/ludwig/repositories/github/${this.owner}/${this.name}/content`
    const fullPath = path.join(repositoryRoot, suggestion.filePath)

    return this.getRepository()
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
                return remote.push([ref], pushOptions(repo.user))
                  .then(() => {
                    return rp({
                      method: 'POST',
                      uri: `https://api.github.com/repos/${repo.owner}/${repo.name}/pulls`,
                      body: {
                        head: `refs/heads/${suggestion.headName}`,
                        base: this.reference,
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
}

module.exports = mongoose.model('Repository', RepositorySchema)
