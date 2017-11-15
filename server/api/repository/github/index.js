'use strict'

var express = require('express')

var router = express.Router()

router.use('/:owner/:repo', require('./repository'))

module.exports = router
