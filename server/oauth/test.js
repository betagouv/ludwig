const expect = require('expect')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
require('../../stub/github')

describe('oauth: github', () => {
  describe('When returning from GitHub at /oauth/github/callback', () => {
    it('should return 200', (done) => {
      supertest(app())
        .get('/oauth/github/callback')
        .expect(302)
        .expect((res) => {
          expect(res.headers.location).toEqual('/')
          expect(res.headers['set-cookie'][0]).toMatch(/great-user/)
          expect()
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
