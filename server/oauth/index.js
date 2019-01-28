'use strict'

var express = require('express')
const querystring = require('querystring')
const rp = require('request-promise')

const config = require('../config/environment')
const User = require('../api/user/user.model')

var router = express.Router()

router.get('/local/callback', (req, res) => {
  const userId = 'local/stub'
  User
    .findById(userId)
    .exec()
    .then(user => {
      if (!user) {
        user = new User({ _id: userId })
      }

      return user.save()
    })
    .then(user => {
      res.cookie('local', user._id, config.session.cookie)
      res.redirect('/account')
    })
})

router.get('/github/callback', (req, res) => {
  rp({
    method: 'POST',
    uri: 'https://github.com/login/oauth/access_token',
    body: {
      client_id: config.github.application.id,
      client_secret: config.github.application.secret,
      code: req.query.code,
      state: req.query.state,
      redirect_uri: config.github.application.redirectURI
    },
    headers: {
      Accept: 'application/json'
    },
    json: true
  }).then(accessTokenPayload => {
    return rp({
      uri: 'https://api.github.com/user',
      headers: {
        Authorization: `token ${accessTokenPayload.access_token}`,
        'User-Agent': config.github.application.userAgent
      },
      json: true
    }).then(userPayload => {
      const userId = `github/${userPayload.login}`
      User
        .findById(userId)
        .exec()
        .then(user => {
          if (!user) {
            user = new User({ _id: userId })
          }

          user.github.access_token = accessTokenPayload
          user.github.details = userPayload

          return user.save()
        }).then(user => {
          res.cookie('github', user.github.details.login, config.session.cookie)
          res.redirect('/account')
        })
    })
  }).catch((error) => {
    var params = querystring.stringify({
      message: error.message
    })
    res.redirect('/error?' + params)
  })
})

module.exports = router
