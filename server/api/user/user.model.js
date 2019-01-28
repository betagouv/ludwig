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

UserSchema.virtual('provider')
  .get(function () {
    return this._id.split('/')[0]
  })

module.exports = mongoose.model('User', UserSchema)
