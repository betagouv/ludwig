#!/usr/bin/env node

'use strict'

var express = require('express')
var path = require('path')

// Setup Express
var app = express()

app.use(express.static(path.resolve(path.join(__dirname, '../client'))))
app.use('/lib', express.static(path.resolve(path.join(__dirname, '../node_modules')), {
  fallthrough: false, // short-circuit 404s
  index: false
}))

app.use('/api/repositories', require('./api/repository'))
app.use('/api/', (req, res) => {
  res.json({
    message: 'You‘re at Ludwig API root!'
  })
})

app.route('/*').get((req, res) => {
  res.sendFile(path.resolve(path.join(__dirname, '../client/index.html')))
})

var port = 4000
app.listen(port, () => {
  console.log('Ludwig server is listening on port %d, in %s mode.', port, app.get('env'))
})

module.exports = app
