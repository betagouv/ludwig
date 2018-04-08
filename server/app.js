'use strict'

const express = require('express')
const cookieParser = require('cookie-parser')
const config = require('./config/environment')

module.exports = function () {
  var app = express()
  app.use(cookieParser(config.session.secret))
  require('./config/express')(app)
  require('./routes')(app)

  return app
}
