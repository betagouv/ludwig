'use strict'

const cookieParser = require('cookie-parser')
const express = require('express')
const mongoose = require('mongoose')
const next = require('next')

mongoose.Promise = require('bluebird')
const config = require('./config/environment')

const dev = config.env !== 'prodution'
const app = next({ dev })

module.exports = function () {
  return app.prepare().then(() => {
    const server = express()

    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      // Connect to database
      mongoose.connect(config.mongo.uri, config.mongo.options)

      // This callback will be triggered once the connection is successfully established to MongoDB
      mongoose.connection.on('connected', function () {
        console.log('Mongoose default connection open to ' + config.mongo.uri)
      })

      // This callback will be triggered after getting disconnected
      mongoose.connection.on('disconnected', function () {
        console.log('Mongoose disconnected from ' + config.mongo.uri)
      })

      mongoose.connection.on('error', function (err) {
        // Ignore 'connection is already open' for test
        console.error('MongoDB connection error: ' + err)
        process.exit(-1)
      })
    }

    server.use(cookieParser(config.session.secret))
    require('./config/express')(server)
    require('./routes')(app, server)

    return server
  })
}
