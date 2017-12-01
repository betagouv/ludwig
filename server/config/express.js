'use strict'

const express = require('express')
const path = require('path')

module.exports = function (app) {
  app.use(express.static(path.resolve(path.join(__dirname, '../../client'))))
  app.use('/lib', express.static(path.resolve(path.join(__dirname, '../../node_modules')), {
    fallthrough: false, // short-circuit 404s
    index: false
  }))
}
