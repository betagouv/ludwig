const expect = require('expect')
const supertest = require('supertest')

const app = require('../app')
require('../../stub/github')

describe('oauth: github', () => {
  describe('When returning from GitHub at /oauth/github/callback', () => {
    it('should return 302', (done) => {
      app().then(server => supertest(server)).then(app => {
        app.get('/oauth/github/callback')
          .expect(302)
          .expect((res) => {
            expect(res.headers.location).toEqual('/')
            expect(res.headers['set-cookie'][0]).toMatch(/great-user/)
            expect()
          })
          .end(done)
      })
    })
  })
})
