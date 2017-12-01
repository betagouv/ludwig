#!/usr/bin/env node

'use strict'

const express = require('express')

var app = express()
require('./config/express')(app)
require('./routes')(app)

var port = 4000
app.listen(port, () => {
  console.log('Ludwig server is listening on port %d, in %s mode.', port, app.get('env'))
})

module.exports = app
