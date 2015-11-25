import request from 'supertest'
import express from 'express'
import apiV1 from '../../api/v1'

const app = express()
app.use('/', apiV1)

const uid = 'post.entry:bengler.www$123'
const event = {
  name: 'upvote',
  document: {
    timeOffset: 120
  }
}

describe('POST /events/:uid', () => {
  it('returns 201 Created', done => {
    request(app)
    .post(`/events/${uid}`)
    .send(event)
    .expect(201, done)
  })

  it('has relative path for created resource in Location header', done => {
    request(app)
    .post(`/events/${uid}`)
    .send(event)
    .expect('Location', /events\/\d+/, done)
  })

  it('creates a new event for :uid', done => {
    request(app)
    .post(`/events/${uid}`)
    .send(event)
    .end((error, response) => {
      if (error) {
        return done(error)
      }
      // Do assertions on the result
      // const result = response.body
      done()
    })
  })

  it('requires an identity')
})
