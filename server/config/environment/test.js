'use strict'

module.exports = {
  session: {
    secret: process.env.SESSION_SECRET || 'not-so-secret',
    cookie: {}
  },
  mongo: {
    uri: 'mongodb://localhost/ludwig-test',
    options: {
      useMongoClient: true
    }
  }
}
