import express from 'express'
import logger from 'morgan'
import apiV1 from './api/v1'

const app = express()

app.use(logger('dev'))

app.use('/api/v1', apiV1)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json('error', {
    message: err.message,
    error: {}
  })
})

export default app
