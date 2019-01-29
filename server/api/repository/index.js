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
      return repository.save()
    })
    .then(repository => {
      req.user.repositories.push(repository._id)
      req.user.repositories = req.user.repositories
      return req.user.save()
    })
    .then(() => {
      return res.json({
        id: id
      })
    })
    .catch((err) => {
      console.log(err)
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
    uri: 'https://api.github.com/user/repos?per_page=100&sort=pushed',
    headers: {
      Authorization: `token ${req.user.github.access_token.access_token}`,
      'User-Agent': config.github.application.userAgent
    },
    json: true,
    resolveWithFullResponse: true
  }).then((repositoryResponse) => {
    return repositoryResponse.body
  }).then((candidates) => {
    return candidates.filter((candidate) => !candidate.archived)
  }).then((candidates) => {
    candidates.sort(function (a, b) {
      return a.full_name < b.full_name ? -1 : (a.full_name === b.full_name ? 0 : 1)
    })
    return candidates
  }).then((candidates) => {
    candidates.forEach((candidate) => {
      candidate.full_name = 'github/' + candidate.full_name
    })
    return candidates
  }).then((candidates) => {
    res.json(candidates)
  }).catch((err) => {
    console.error(err)
    res.status(500).json([])
  })
})

module.exports = router
