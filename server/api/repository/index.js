'use strict'

var express = require('express')
const repoList = require('../../config/environment').alpha.repositoryList
const repositoryIds = repoList.map((repo) => repo.id)

var router = express.Router()
router.get('/', (req, res) => res.json(repositoryIds))
router.use('/github', require('./github'))

module.exports = router
