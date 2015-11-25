import request from 'supertest'
import express from 'express'
import apiV1 from '../../api/v1'
import models from '../../models'
import {assert} from 'chai'

import objectAssign from 'object-assign'

/* eslint-disable max-nested-callbacks */

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
    const url = `/events/${uid}`

    request(app)
    .post(url)
    .send(event)
    .end((err, response) => {
      if (err) {
        return done(err)
      }

      models.Event.findOne({order: 'id DESC'})
      .then(newEvent => {
        assert.propertyVal(response.headers, 'location', `${url}/${newEvent.id}`)
      })
      .then(() => {
        done()
      })
      .catch(error => {
        done(error)
      })
    })
  })

  it('creates a new event', done => {
    request(app)
    .post(`/events/${uid}`)
    .send(objectAssign({}, event, {
      name: 'A new thing',
      not: 'included',
      document: {
        meta: 'data'
      }
    }))
    .end((error, response) => {
      if (error) {
        return done(error)
      }

      models.Event.findOne({order: 'id DESC'})
      .then(newEvent => {
        assert.ok(newEvent)
        assert.propertyVal(newEvent, 'uid', uid)
        assert.propertyVal(newEvent, 'name', 'A new thing')
        assert.propertyVal(newEvent.document, 'meta', 'data')
        assert.notProperty(newEvent, 'not')
      })
      .then(() => {
        done()
      })
      .catch(err => {
        done(err)
      })
    })
  })

  it('requires an identity')
})

/* eslint-enable max-nested-callbacks */
