import express from 'express'
import logger from 'morgan'
import V1 from './api/v1'
import jsonError from './lib/jsonError'

const app = express()

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
