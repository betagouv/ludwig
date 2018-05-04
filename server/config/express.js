'use strict'

const bodyParser = require('body-parser')

module.exports = function (app) {
  app.use(bodyParser.json({ limit: '1mb' }))
}
