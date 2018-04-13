'use strict'

var all = {
  env: process.env.NODE_ENV,
  session: {
    secret: process.env.SESSION_SECRET || 'not-so-secret',
    cookie: {
      signed: true
    }
  },
  github: {
    application: {
      id: process.env.GITHUB_APP_CLIENT_ID || 'ba0f9fbf5bc8d9759c50',
      redirectURI: process.env.GITHUB_APP_REDIRECT_URI || 'http://localhost:4000/oauth/github/callback',
      secret: process.env.GITHUB_APP_CLIENT_SECRET || 'GITHUB_APP_CLIENT_SECRET',
      userAgent: process.env.GITHUB_APP_USER_AGENT || 'Ludwig-test-701557'
    },
    user: {
      name: 'Ludwig Wittgenstein',
      email: 'contact@ludwig.incubateur.net',
      token: process.env.GITHUB_LUDWIG_USER_TOKEN || 'GITHUB_LUDWIG_USER_TOKEN'
    }
  },
  mongo: {
    uri: 'mongodb://localhost/ludwig',
    options: {
      useMongoClient: true
    }
  }
}

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = Object.assign(
  all,
  require('./' + process.env.NODE_ENV) || {}
)
