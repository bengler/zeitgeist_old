import request from 'supertest'
import express from 'express'
import apiV1 from '../../../api/v1'
import models from '../../../models'
import {assert} from 'chai'

import objectAssign from 'object-assign'

/* eslint-disable max-nested-callbacks */

const app = express()
app.use('/', apiV1)

const uid = 'post.entry:bengler.www$123'
const event = {
  name: 'upvote',
  document: {
    uid,
    timeOffset: 120
  }
}

describe('POST /events/:name/:uid', () => {
  beforeEach(done => {
    models.Event.sync({force: true})
    .then(() => done()).catch(error => done(error))
  })

  it('does not accept wildcard uids', done => {
    request(app)
    .post(`/events/upvote/post.entry:*`)
    .expect(400)
    .expect({
      status: 400,
      message: 'uid cannot contain wildcard'
    }, done)
  })

  it('returns 201 Created', done => {
    request(app)
    .post(`/events/upvote/${uid}`)
    .expect(201, done)
  })

  it('has relative path for created resource in Location header', done => {
    request(app)
    .post(`/events/upvote/${uid}`)
    .expect(201)
    .end((err, response) => {
      if (err) {
        return done(err)
      }

      models.Event.findOne({order: 'id DESC'})
      .then(newEvent => {
        assert.propertyVal(response.headers, 'location', `/${newEvent.id}`)
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
    .post('/events/new_event/myUid')
    .send(objectAssign({}, event, {
      meta: 'data'
    }))
    .end((error, response) => {
      if (error) {
        return done(error)
      }

      models.Event.findOne({order: 'id DESC'})
      .then(newEvent => {
        assert.ok(newEvent)
        assert.propertyVal(newEvent, 'uid', 'myUid')
        assert.propertyVal(newEvent, 'name', 'new_event')
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

describe('GET /events/:name/:uid/:id', () => {
  beforeEach(done => {
    models.Event.sync({force: true}) // drops table and re-creates it
    .then(() => {
      return models.Event.bulkCreate([
        {id: 29, createdAt: 0, updatedAt: 0, uid, name: 'applause', document: {first: true}},
      ])
    })
    .then(() => done()).catch(error => done(error))
  })

  it('returns the event requested', done => {
    request(app)
    .get(`/events/applause/${uid}/29`)
    .expect(res => {
      // Remove these since they change
      delete res.body.event.createdAt
      delete res.body.event.updatedAt
    })
    .expect(200, {
      event: {
        id: 29,
        name: 'applause',
        uid,
        document: {first: true}
      }
    }, done)
  })
})

describe('GET /events/:name', () => {
  beforeEach(done => {
    models.Event.sync({force: true}) // drops table and re-creates it
    .then(() => {
      return models.Event.bulkCreate([
        {uid, name: 'applause', document: {first: true}},
        {uid, name: 'applause', document: {first: false}},
        {uid, name: 'stream', document: {meta: 'data'}},
        {uid, name: 'applause', document: {last: true}},
      ])
    })
    .then(() => done()).catch(error => done(error))
  })

  it('does pagination and shows total hits', done => {
    request(app)
    .get(`/events/applause`)
    .query({
      limit: 1,
      offset: 2
    })
    .end((error, response) => {
      if (error) {
        return done(error)
      }

      const result = response.body
      assert.equal(result.rows.length, 1)
      assert.property(result, 'pagination')

      const expectedHits = 3
      assert.propertyVal(result, 'total', expectedHits, 'Should show 3 total hits')

      const row = result.rows[0]
      assert.propertyVal(row.document, 'last', true)
      done()
    })
  })
})

/* eslint-enable max-nested-callbacks */
