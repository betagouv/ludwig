'use strict'

var express = require('express')
const rp = require('request-promise')

const config = require('../../config/environment')
const User = require('../user/user.model')
const repoList = config.alpha.repositoryList
const repositoryIds = repoList.map((repo) => repo.id)

var router = express.Router()
router.get('/', (req, res) => res.json(repositoryIds))
router.use('/github', require('./github'))

router.get('/candidates', (req, res) => {
  const userId = `github/${config.session.cookie.signed ? req.signedCookies.github : req.cookies.github}`

  User
    .findById(userId)
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).json([])
      }

      return rp({
        uri: 'https://api.github.com/user/repos?per_page=100',
        headers: {
          Authorization: `token ${user.github.access_token.access_token}`,
          'User-Agent': config.github.application.userAgent
        },
        json: true,
        resolveWithFullResponse: true
      })
    }).then((repositoryResponse) => {
      res.json(repositoryResponse.body)
    }).catch(() => {
      res.status(500).json([])
    })
})

module.exports = router
