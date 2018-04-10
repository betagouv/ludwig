const mongoose = require('mongoose')

after(function (done) {
  mongoose.connection.db.dropDatabase(function () {
    mongoose.connection.close(done)
  })
})
