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

describe('GET /events/:uid/:name', () => {
  beforeEach(done => {
    models.Event.sync({force: true}) // drops table and re-creates it
    .then(() => {
      done(null)
    })
    .catch(error => {
      done(error)
    })
  })

  it('returns rows and count as JSON', done => {
    request(app)
    .get(`/events/something/name`)
    .expect('Content-Type', /json/)
    .expect({
      rows: [],
      count: 0
    }, done)
  })

  it('returns events of :name for :uid', done => {
    models.Event.bulkCreate([
      {uid: uid, name: 'applause'},
      {uid: uid, name: 'applause'},
      {uid: uid, name: 'some other event'},
      {uid: 'other uid', name: 'applause'},
    ])
    .then(result => {
      request(app)
      .get(`/events/${uid}/applause`)
      .expect(200)
      .end((error, response) => {
        if (error) {
          return done(error)
        }
        const events = response.body.rows
        assert.equal(events.length, 2, 'Returned wrong number of events')
        events.forEach(returnedEvent => {
          assert.propertyVal(returnedEvent, 'name', 'applause')
          assert.propertyVal(returnedEvent, 'uid', uid)
        })
        done()
      })
    })
  })
})

/* eslint-enable max-nested-callbacks */
