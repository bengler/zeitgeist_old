import express from 'express'
import logger from 'morgan'
import V1 from './api/v1'
import jsonError from './lib/jsonError'
import makeCheckpoint from './lib/createCheckpoint'

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
      const base = baseUrl
      const checkpoint = makeCheckpoint(base)
      checkpoint.get('/identities/me', {session: sessionId})
      .then(result => {
        if (result.body.identity) {
          resolve(result.body.identity)
        } else {
          reject()
        }
      })
      .catch(error => {
        reject(error)
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
