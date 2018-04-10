const expect = require('expect')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../../app')

describe('api: repository', () => {
  describe('When requesting /api/repositories', () => {
    it('should return 200', (done) => {
      supertest(app())
        .get('/api/repositories/')
        .expect(200)
        .expect((res) => {
          expect(res.body instanceof Array).toBeTruthy()
        })
        .end(done)
    })
  })

  after(function (done) {
    mongoose.connection.db.dropDatabase(function () {
      mongoose.connection.close(done)
    })
  })
})
