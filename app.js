import express from 'express'
import logger from 'morgan'
import V1 from './api/v1'
import jsonError from './lib/jsonError'
import makeCheckpoint from './lib/createCheckpoint'
import config from './config'

const app = express()

// remove x-powered-by
app.use((req, res, next) => {
  res.removeHeader('x-powered-by')
  next()
})

app.use(logger('dev'))

app.use('/api/zeitgeist/v1', V1({
  // This checks checkpoint session remotely
  checkIdentity: (baseUrl, sessionId) => {
    return new Promise((resolve, reject) => {
      const base = config.pebbleHost || baseUrl
      makeCheckpoint(base).get('/identities/me', {session: sessionId})
      .then(result => {
        resolve(result.body.identity)
      })
    })
  }
}))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers
app.use((err, req, res, next) => {
  return jsonError.call(res, err.status || 500, err) // eslint-disable-line prefer-reflect
})

export default app
