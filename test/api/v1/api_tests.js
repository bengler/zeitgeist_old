import request from 'supertest'
import express from 'express'
import apiV1 from '../../../api/v1'
import models from '../../../models'
import {assert} from 'chai'

import objectAssign from 'object-assign'
import checkpointIdentity from '../../fixtures/checkpointIdentity.json'

/* eslint-disable max-nested-callbacks */

const validSession = 'abcdef0123456789'
const apiOptions = {
  checkIdentity: (baseUrl, sessionId) => {
    return new Promise((resolve, reject) => {
      if (sessionId === validSession) {
        resolve(checkpointIdentity.identity)
      } else {
        reject()
      }
    })
  }
}

const app = express()
app.use('/', apiV1(apiOptions))

const uid = 'post.entry:bengler.www$123'
const event = {
  name: 'upvote',
  document: {
    uid,
    timeOffset: 120
  }
}

// Common identify tests
// Pass the HTTP verb, the path to test and optionally what
// HTTP status code is concidered a success at this path
function itRequiresIdentity(method, path, okStatus = 200) {
  it('returns 401 without checkpoint session', done => {
    request(app)[method](path)
    .expect(401, 'No current identity.', done)
  })

  it('returns 401 with invalid checkpoint session', done => {
    request(app)[method](path)
    .set('Cookie', [`checkpoint:session=invalid`])
    .expect(401, done)
  })

  it(`returns ${okStatus} with valid checkpoint session`, done => {
    request(app)[method](path)
    .set('Cookie', [`checkpoint:session=${validSession}`])
    .expect(okStatus, done)
  })
}

describe('POST /events/:name/:uid', () => {
  beforeEach(done => {
    models.Event.sync({force: true})
    .then(() => done()).catch(error => done(error))
  })

  itRequiresIdentity('post', `/events/upvote/${uid}`, 201)

  it('does not accept wildcard uids', done => {
    request(app)
    .post(`/events/upvote/post.entry:*`)
    .set('Cookie', [`checkpoint:session=${validSession}`])
    .expect(400)
    .expect({
      error: {},
      status: 400,
      message: 'uid cannot contain wildcard'
    }, done)
  })

  it('has relative path for created resource in Location header', done => {
    request(app)
    .post(`/events/upvote/${uid}`)
    .set('Cookie', [`checkpoint:session=${validSession}`])
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
    .set('Cookie', [`checkpoint:session=${validSession}`])
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
        done()
      })
      .catch(err => {
        done(err)
      })
    })
  })

  it('attaches the identity to the event', done => {
    request(app)
    .post('/events/upvote/post.entry:monster.thestream$123')
    .set('Cookie', [`checkpoint:session=${validSession}`])
    .send(event)
    .end((error, response) => {
      if (error) {
        return done(error)
      }

      models.Event.findOne({order: 'id DESC'})
      .then(newEvent => {
        assert.ok(newEvent)
        assert.property(newEvent, 'identity')
        const identity = newEvent.identity
        assert.deepEqual(checkpointIdentity.identity, identity)
        done()
      })
      .catch(err => {
        done(err)
      })
    })
  })
})

describe('GET /events/:name/:uid/:id', () => {
  beforeEach(done => {
    models.Event.sync({force: true}) // drops table and re-creates it
    .then(() => {
      return models.Event.bulkCreate([
        {
          id: 29,
          createdAt: 0,
          updatedAt: 0,
          uid,
          name: 'applause',
          identity: {name: 'Rune'},
          document: {
            first: true
          }},
      ])
    })
    .then(() => done()).catch(error => done(error))
  })

  itRequiresIdentity('get', `/events/applause/${uid}/29`, 200)

  it('returns the event requested', done => {
    request(app)
    .get(`/events/applause/${uid}/29`)
    .set('Cookie', [`checkpoint:session=${validSession}`])
    .expect(res => {
      // Remove these since they change
      delete res.body.event.createdAt
      delete res.body.event.updatedAt
    })
    .expect(200, {
      event: {
        id: 29,
        name: 'applause',
        identity: {
          name: 'Rune'
        },
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

  itRequiresIdentity('get', `/events/applause`, 200)

  it('does pagination and shows total hits', done => {
    request(app)
    .get(`/events/applause`)
    .set('Cookie', [`checkpoint:session=${validSession}`])
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
