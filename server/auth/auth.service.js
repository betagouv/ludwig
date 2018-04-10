'use strict'

const config = require('../config/environment')
const compose = require('composable-middleware')

const User = require('../api/user/user.model')

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 401
 */
function isAuthenticated () {
  return compose()
    // Attach user to request
    .use(function (req, res, next) {
      const userId = `github/${config.session.cookie.signed ? req.signedCookies.github : req.cookies.github}`
      User
        .findById(userId)
        .exec()
        .then(user => {
          if (!user) {
            return res.sendStatus(401)
          }

          req.user = user
          next()
        })
        .catch(() => {
          res.sendStatus(500)
        })
    })
}

exports.isAuthenticated = isAuthenticated
