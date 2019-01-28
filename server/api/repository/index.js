'use strict'

var express = require('express')
const rp = require('request-promise')

const auth = require('../../auth/auth.service')
const config = require('../../config/environment')
const Repository = require('./github/repository/repository.model')

var router = express.Router()
router.use('/github', require('./github'))

router.post('/', auth.isAuthenticated(), (req, res) => {
  const id = req.body.id
  if (!id) {
    return res.status(400).json({
      message: 'id is missing.'
    })
  }

  Repository
    .findById(id)
    .exec()
    .then(existingRepository => {
      if (existingRepository) {
        return res.status(500).json({
          message: id + ' is already active.'
        })
      }

      var repository = new Repository({
        _id: id,
        user: req.user
      })
      repository.save()
        .then(repository => {
          return res.json({
            id: id
          })
        })
    })
    .catch(() => {
      return res.sendStatus(500)
    })
})

router.get('/candidates', auth.isAuthenticated(), (req, res) => {
  if (req.user.provider === 'local') {
    return res.json([{
      full_name: 'local/celebrities/ludwig'
    }, {
      full_name: 'local/celebrities/shakespeare'
    }])
  }

  rp({
    uri: 'https://api.github.com/user/repos?per_page=100',
    headers: {
      Authorization: `token ${req.user.github.access_token.access_token}`,
      'User-Agent': config.github.application.userAgent
    },
    json: true,
    resolveWithFullResponse: true
  }).then((repositoryResponse) => {
    return repositoryResponse.body
  }).then((candidates) => {
    candidates.forEach((candidate) => {
      candidate.full_name = 'github/' + candidate.full_name
    })
    return candidates
  }).then((candidates) => {
    res.json(candidates)
  }).catch(() => {
    res.status(500).json([])
  })
})

module.exports = router
