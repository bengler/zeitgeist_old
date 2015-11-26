import request from 'supertest'
import express from 'express'
import apiV1 from '../../../api/v1'
import {assert} from 'chai'

/* eslint-disable max-nested-callbacks */

const trustedOrigin = 'http://trusted-domain.com'

const app = express()
const apiOptions = {
  checkCors: (reqHost, originHost) => {
    return originHost === 'trusted-domain.com'
  }
}
app.use('/', apiV1(apiOptions))

describe('CORS headers', () => {
  it('accepts origin in list of trusted domains', done => {
    request(app)
    .get('/')
    .set('Origin', trustedOrigin)
    .expect('Access-Control-Allow-Origin', trustedOrigin)
    .expect('Access-Control-Expose-Headers', '')
    .expect('Access-Control-Allow-Credentials', 'true', done)
  })

  it('preflights requests', done => {
    request(app)
    .get('/')
    .set('Origin', trustedOrigin)
    .expect('Access-Control-Allow-Origin', trustedOrigin)
    .expect('Access-Control-Expose-Headers', '')
    .expect('Access-Control-Allow-Credentials', 'true', done)
  })

  it('omits access control headers when origin is not trusted', done => {
    request(app)
    .get('/')
    .set('Origin', 'http://evil.com')
    .end((err, result) => {
      if (err) {
        return done(err)
      }
      assert.notProperty(result.headers, 'access-control-allow-origin')
      assert.notProperty(result.headers, 'access-control-expose-headers')
      assert.notProperty(result.headers, 'access-control-allow-credentials')
      done()
    })
  })
})
