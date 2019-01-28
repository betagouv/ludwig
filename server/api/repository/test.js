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

  describe('When posting to /repository', () => {
    it('should return 200', (done) => {
      const id = 'local/celebrities/ludwig'
      supertest(app())
        .post('/api/repository')
        .send({ id: id })
        .set('Cookie', 'userId=local%2Fstub;')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ id: id })
        }).end(done)
    })
  })
})
