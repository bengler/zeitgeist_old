import request from 'supertest'
import express from 'express'
import apiV1 from '../../../api/v1'
import models from '../../../models'
import {assert} from 'chai'

import objectAssign from 'object-assign'
/* eslint-disable import/no-named-as-default */
import checkpointIdentity from '../../fixtures/checkpointIdentity.json'
/* eslint-enable import/no-named-as-default */

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

const uid = '1234567890'
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
    .expect(401, done)
  })

  it('returns 401 with invalid checkpoint session', done => {
    request(app)[method](path)
    .set('Cookie', [`checkpoint.session=invalid`])
    .expect(401, done)
  })

  it(`returns ${okStatus} with valid checkpoint session`, done => {
    request(app)[method](path)
    .set('Cookie', [`checkpoint.session=${validSession}`])
    .expect(okStatus, done)
  })

  it(`returns ${okStatus} with valid session query param`, done => {
    const queryPath = `${path}?session=${validSession}`
    request(app)[method](queryPath)
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
    .set('Cookie', [`checkpoint.session=${validSession}`])
    .expect(400, done)
  })

  it('stores Events with deleted=false', done => {
    request(app)
    .post(`/events/upvote/abc`)
    .set('Cookie', [`checkpoint.session=${validSession}`])
    .expect(201)
    .end((err, resp) => {
      if (err) {
        return done(err)
      }
      models.Event.findOne({where: {uid: 'abc'}})
      .then(newObj => {
        assert.ok(newObj)
        assert.ok(newObj.deleted === false, `deleted is '${newObj.deleted})'`)
        done()
      })
      .catch(findErr => done(findErr))
    })
  })

  it('has relative path for created resource in Location header', done => {
    request(app)
    .post(`/events/upvote/${uid}`)
    .set('Cookie', [`checkpoint.session=${validSession}`])
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
    .set('Cookie', [`checkpoint.session=${validSession}`])
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
    .set('Cookie', [`checkpoint.session=${validSession}`])
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

describe('GET /events/:name/ query params', () => {
  beforeEach(done => {
    models.Event.sync({force: true}) // drops table and re-creates it
    .then(() => {
      return models.Event.bulkCreate([
        {
          uid,
          deleted: false,
          createdAt: new Date('2015-01-01 14:00:00'),
          name: 'streamed',
        },
        {
          uid,
          deleted: false,
          createdAt: new Date('2015-01-01'),
          name: 'streamed',
        },
        {
          uid,
          deleted: false,
          createdAt: new Date('2015-01-02 12:00:00'),
          name: 'streamed',
        },
        {
          uid: 123,
          deleted: false,
          createdAt: new Date('2015-01-03'),
          name: 'streamed',
        },
      ])
    })
    .then(() => done()).catch(error => done(error))
  })

  describe('ranges', () => {
    it('limits rows to time fields', done => {
      request(app)
      .get('/events/streamed?count=true&from=2015-01-01&to=2015-01-02')
      .expect(200)
      .end((err, result) => {
        if (err) {
          return done(err)
        }
        assert.deepEqual(result.body.rows, [
          {uid: uid, count: '2'}
        ])
        done()
      })
    })
  })

  describe('count=true', () => {

    describe('unique properties', () => {
      beforeEach(done => {
        models.Event.bulkCreate([
          {
            uid: 'myId',
            deleted: false,
            name: 'applause',
            createdAt: new Date('2010-01-01 14:00:00'),
            document: {
              time: 1
            }
          },
          {
            uid: 'myId',
            deleted: false,
            name: 'applause',
            createdAt: new Date('2015-01-01 14:00:00'),
            document: {
              time: 1
            }
          },
          {
            uid: 'myId',
            deleted: false,
            name: 'applause',
            createdAt: new Date('2015-01-01 14:00:00'),
            document: {
              time: 2
            }
          },
          {
            uid: 'hm',
            deleted: false,
            createdAt: new Date('2015-01-01 14:00:00'),
            name: 'applause',
          },
        ]).then(() => done()).catch(err => done(err))
      })

      it('counts unique properties', done => {

        request(app)
        .get(`/events/applause/myId?count=true&field=time`)
        .expect(200)
        .end((err, result) => {
          if (err) {
            return done(err)
          }

          const expect = [
            {
              uid: 'myId',
              count: '2',
              document: {
                time: 1
              }
            },
            {
              uid: 'myId',
              count: '1',
              document: {
                time: 2
              }
            }
          ]

          assert.deepEqual(result.body.rows, expect)
          done()
        })
      })

      it('time-limits count of unique properties', done => {

        request(app)
        .get('/events/applause/myId?count=true&field=time&from=2014-01-01&to=2016-01-02')
        .expect(200)
        .end((err, result) => {
          if (err) {
            return done(err)
          }

          const expect = [
            {
              uid: 'myId',
              count: '1',
              document: {time: 1}
            },
            {
              uid: 'myId',
              count: '1',
              document: {time: 2}
            }
          ]

          assert.deepEqual(result.body.rows, expect)
          done()
        })
      })
    })

    it('paginates with limit', done => {
      request(app)
      .get('/events/streamed?count=true&limit=1')
      .expect(200)
      .end((err, result) => {
        if (err) {
          return done(err)
        }
        assert.deepEqual(result.body.rows, [
          {uid: uid, count: '3'},
        ])
        done()
      })
    })

    it('paginates with offset', done => {
      request(app)
      .get('/events/streamed?count=true&limit=1&offset=1')
      .expect(200)
      .end((err, result) => {
        if (err) {
          return done(err)
        }
        assert.deepEqual(result.body.rows, [
          {uid: '123', count: '1'}
        ])
        done()
      })
    })
  })

  it('counts the occurrences of events', done => {
    request(app)
    .get('/events/streamed?count=true')
    .expect(200)
    .end((err, result) => {
      if (err) {
        return done(err)
      }
      assert.deepEqual(result.body.rows, [
        {uid: uid, count: '3'},
        {uid: '123', count: '1'}
      ])
      done()
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
          clientIp: '8.8.4.4',
          uid,
          deleted: false,
          name: 'applause',
          identity: {name: 'Rune'},
          document: {
            first: true
          }},
      ])
    })
    .then(() => done()).catch(error => done(error))
  })

  it('returns the event requested', done => {
    request(app)
    .get(`/events/applause/${uid}/29`)
    .expect(res => {
      // Remove these since they change
      Reflect.deleteProperty(res.body.event, 'createdAt')
      Reflect.deleteProperty(res.body.event, 'updatedAt')
    })
    .expect(200, {
      event: {
        id: 29,
        deleted: false,
        name: 'applause',
        clientIp: '8.8.4.4',
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
        {uid, name: 'applause', deleted: false, document: {first: true}},
        {uid, name: 'applause', deleted: false, document: {first: false}},
        {uid, name: 'stream', deleted: false, document: {meta: 'data'}},
        {uid, name: 'applause', deleted: false, document: {last: true}},
      ])
    })
    .then(() => done()).catch(error => done(error))
  })

  it('does pagination', done => {
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

      const row = result.rows[0]
      assert.propertyVal(row.document, 'last', true)
      done()
    })
  })
})

/* eslint-enable max-nested-callbacks */
