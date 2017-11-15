'use strict'

var express = require('express')

var router = express.Router()
router.get('/', (req, res) => {
  res.json(require('./list'))
})

router.use('/github', require('./github'))

module.exports = router
