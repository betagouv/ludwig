'use strict'

const alphaUser = {
  name: 'ludwig-test',
  token: process.env.GITHUB_PUSH_TOKEN || 'GITHUB_PUSH_TOKEN'
}

var all = {
  env: process.env.NODE_ENV,

  github: {
    application: {
      id: process.env.GITHUB_APP_CLIENT_ID || 'GITHUB_APP_CLIENT_ID',
      secret: process.env.GITHUB_APP_CLIENT_SECRET || 'GITHUB_APP_CLIENT_SECRET',
      userAgent: 'Ludwig-504245'
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
