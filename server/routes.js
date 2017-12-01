'use strict'

const path = require('path')

module.exports = function (app) {
  app.use('/api/repositories', require('./api/repository'))
  app.use('/api/', (req, res) => {
    res.json({
      message: 'You‘re at Ludwig API root!'
    })
  })

  app.route('/*').get((req, res) => {
    res.sendFile(path.resolve(path.join(__dirname, '../client/index.html')))
  })
}
