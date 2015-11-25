import request from 'supertest'
import express from 'express'
import apiV1 from '../../api/v1'

const app = express()
app.use('/', apiV1)

describe('GET /events', () => {
  it('returns events', done => {
    request(app)
    .get('/events')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect([])
    .expect(200, done)
  })
})
