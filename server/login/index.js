'use strict'

var express = require('express')
const querystring = require('querystring')

const config = require('../config/environment')

const auth = require('../auth/auth.service')

var router = express.Router()

router.get('/github', (req, res) => {
  var params = querystring.stringify({
    client_id: config.github.application.id,
    redirect_uri: config.github.application.redirectURI,
    state: '1234',
    scope: 'repo'
  })
  res.redirect('https://github.com/login/oauth/authorize?' + params)
})

router.get('/local', (req, res) => {
  res.redirect('/oauth/local/callback')
})

router.get('/', auth.isAuthenticated(), (req, res) => {
  res.json({
    id: req.user._id,
    repositories: req.user.repositories
  })
})

router.delete('/', (req, res) => {
  res.clearCookie('userId')
  res.json({
    github: true
  })
})

module.exports = router
