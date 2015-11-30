import express from 'express'
import logger from 'morgan'
import V1 from './api/v1'
import jsonError from './lib/jsonError'

const app = express()
// We are a proxied pebble, so we need to act like what ever
// hostname we are called from. If not, our request.host will be
// the pebble hosted (zeitgeist.o5.no), not app.com/api/zeitgeist
// http://expressjs.com/guide/behind-proxies.html
app.set('trust proxy', true)

// remove x-powered-by
app.use((req, res, next) => {
  res.removeHeader('x-powered-by')
  next()
})

app.use(logger('dev'))

app.use('/api/zeitgeist/v1', V1())

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
