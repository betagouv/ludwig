'use strict'

const alphaUser = {
  name: 'ludwig-test',
  token: process.env.GITHUB_PUSH_TOKEN || 'GITHUB_PUSH_TOKEN'
}

var all = {
  env: process.env.NODE_ENV,
  github: {
    application: {
      id: process.env.GITHUB_APP_CLIENT_ID || 'b5a749648fca58d886ec',
      secret: process.env.GITHUB_APP_CLIENT_SECRET || 'GITHUB_APP_CLIENT_SECRET',
      userAgent: process.env.GITHUB_APP_USER_AGENT || 'Ludwig-504245'
    },
    user: {
      name: 'Ludwig Wittgenstein',
      email: 'contact@ludwig.incubateur.net',
      token: process.env.GITHUB_LUDWIG_USER_TOKEN || 'GITHUB_LUDWIG_USER_TOKEN'
    }
  },

  alpha: {
    repositoryList: [{
      id: 'github/ludwig-test/openfisca-france',
      testDirectory: 'tests/mes-aides.gouv.fr',
      user: alphaUser
    }, {
      id: 'github/ludwig-test/openfisca-paris',
      user: alphaUser
    }, {
      id: 'github/ludwig-test/openfisca-rennesmetropole',
      user: alphaUser
    }]
  }
}

module.exports = all
