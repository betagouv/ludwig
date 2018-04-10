'use strict'

module.exports = {
  github: {
    application: {
      id: process.env.GITHUB_APP_CLIENT_ID || 'b5a749648fca58d886ec',
      redirectURI: process.env.GITHUB_APP_REDIRECT_URI || 'https://ludwig.incubateur.net/oauth/github/callback',
      secret: process.env.GITHUB_APP_CLIENT_SECRET,
      userAgent: process.env.GITHUB_APP_USER_AGENT || 'Ludwig-504245'
    },
    user: {
      name: 'Ludwig Wittgenstein',
      email: 'contact@ludwig.incubateur.net',
      token: process.env.GITHUB_LUDWIG_USER_TOKEN
    }
  }
}
