import express from 'express'
import models from './../models'
import pebblesCors from '@bengler/pebbles-cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import checkIdentity from '../lib/checkIdentity'

/*
options.checkCors is a custom function to determine trusted domains
options.checkIdentity is a custom function to verify sessions
*/
function V1(options = {}) {
  const router = express.Router()
  router.use(cookieParser())
  router.use(bodyParser.json())

  const corsMiddleware = pebblesCors(options.checkCors)
  router.use(corsMiddleware)

  const identityCheck = checkIdentity(options.checkIdentity)
  router.use(identityCheck)

  router.post('/events/:name/:uid', (req, res, next) => {
    if (req.params.uid.indexOf('*') !== -1) {
      const error = new Error('uid cannot contain wildcard')
      error.status = 400
      return next(error)
    }

    const attr = {
      uid: req.params.uid,
      name: req.params.name,
      identity: res.locals.checkpointIdentity,
      document: req.body || {}
    }
    models.Event.create(attr)
    .then(event => {
      res
      .header('Location', `/${event.id}`)
      .status(201)
      .json('Created')
    })
  })

  router.get('/events/:name/:uid/:id', (req, res, next) => {
    models.Event.findOne({
      where: {
        name: req.params.name,
        uid: req.params.uid,
        id: req.params.id,
      }
    })
    .then(queryResult => {
      if (queryResult.dataValues) {
        res
        .status(200).json({event: queryResult.dataValues})
      } else {
        const err = new Error('Not found')
        err.status = 404
        return next(err)
      }
    })
    .catch(error => {
      return next(error)
    })
  })

  const defaultLimit = 100
  const defaultOffset = 0
  router.get('/events/:name/:uid*?', (req, res, next) => {
    const where = {name: req.params.name}
    if (req.params.uid) {
      where.uid = req.params.uid
    }
    if (req.params.id) {
      where.id = req.params.id
    }
    const limit = req.query.limit || defaultLimit
    const offset = req.query.offset || defaultOffset
    const order = '"createdAt" DESC'
    models.Event.findAndCountAll({where, limit, offset, order})
    .then(queryResult => {
      res
      .status(200)
      .json({
        rows: queryResult.rows,
        pagination: {
          limit,
          offset,
        },
        total: queryResult.count,
      })
    })
    .catch(error => {
      next(error)
    })
  })

  return router
}

export default V1
