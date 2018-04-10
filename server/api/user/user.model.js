'use strict'

const mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
  _id: String,
  github: {
    type: Object,
    default: {}
  },
  repositories: {
    type: [String],
    default: []
  }
})

module.exports = mongoose.model('User', UserSchema)
