const expect = require('expect')
const supertest = require('supertest')

const app = require('../app')
require('../../stub/github')

describe('oauth: local', () => {
  describe('When going to /oauth/local/callback', () => {
    it('should return 302', (done) => {
      supertest(app())
        .get('/oauth/local/callback')
        .expect(302)
        .expect((res) => {
          expect(res.headers.location).toEqual('/account')
          expect(res.headers['set-cookie'][0]).toMatch(/userId=local.*stub/)
          expect()
        })
        .end(done)
    })
  })
})

describe('oauth: github', () => {
  describe('When returning from GitHub at /oauth/github/callback', () => {
    it('should return 302', (done) => {
      supertest(app())
        .get('/oauth/github/callback')
        .expect(302)
        .expect((res) => {
          expect(res.headers.location).toEqual('/account')
          expect(res.headers['set-cookie'][0]).toMatch(/userId=github.*great-user/)
          expect()
        })
        .end(done)
    })
  })
})
