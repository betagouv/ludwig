'use strict'

var express = require('express')
const querystring = require('querystring')

const config = require('../config/environment')

var router = express.Router()

router.get('/github', (req, res) => {
  var params = querystring.stringify({
    client_id: config.github.application.id,
    redirect_uri: config.github.application.redirectURI,
    state: '1234'
  })
  res.redirect('https://github.com/login/oauth/authorize?' + params)
})

module.exports = router
