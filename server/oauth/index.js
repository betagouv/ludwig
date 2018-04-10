'use strict'

var express = require('express')
const rp = require('request-promise')

const config = require('../config/environment')
var router = express.Router()

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
      'Accept': 'application/json'
    },
    json: true
  }).then(accessTokenPayload => {
    rp({
      uri: 'https://api.github.com/user',
      headers: {
        'Authorization': `token ${accessTokenPayload.access_token}`,
        'User-Agent': config.github.application.userAgent
      },
      json: true
    }).then(userPayload => {
      res.cookie('github', userPayload.login, config.session.cookie)
      res.redirect('/')
    })
  })
})

module.exports = router
