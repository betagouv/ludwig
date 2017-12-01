const supertest = require('supertest')
const app = require('../../app')
const expect = require('expect')

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
})
