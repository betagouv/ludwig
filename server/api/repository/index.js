'use strict'

var express = require('express')

var router = express.Router()
router.get('/', function (req, res) {
  res.json([{
    id: 'github/sgmap/openfisca-france'
  }, {
    id: 'github/sgmap/openfisca-paris'
  }, {
    id: 'github/sgmap/openfisca-rennesmetropole'
  }])
})

module.exports = router
