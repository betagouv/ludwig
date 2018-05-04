'use strict'

module.exports = function (app, server) {
  server.use('/api/repositories', require('./api/repository'))
  server.use('/api/', (req, res) => {
    res.json({
      message: 'You‘re at Ludwig API root!'
    })
  })
  server.use('/login', require('./login'))
  server.use('/oauth', require('./oauth'))

  const handle = app.getRequestHandler()
  server.get('*', (req, res) => {
    return handle(req, res)
  })
}
