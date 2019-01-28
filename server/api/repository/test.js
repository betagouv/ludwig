const expect = require('expect')
const supertest = require('supertest')

const app = require('../../app')

describe('api: repository', () => {
  before((done) => {
    supertest(app())
      .get('/oauth/local/callback')
      .end(done)
  })

  describe('When requesting /candidates', () => {
    it('should return 200', (done) => {
      supertest(app())
        .get('/api/repository/candidates')
        .set('Cookie', 'userId=local%2Fstub;')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy()
        })
        .end(done)
    })
  })
})
