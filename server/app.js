'use strict'

const express = require('express')

module.exports = function () {
  var app = express()
  require('./config/express')(app)
  require('./routes')(app)

  return app
}
