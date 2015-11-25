import express from 'express'
import models from './../models'

/*
import cookieParser from 'cookie-parser'
*/
import bodyParser from 'body-parser'

const router = express.Router()
router.use(bodyParser.json())

/*
router.use(bodyParser.urlencoded({extended: false}))
router.use(cookieParser())
*/

function jsonError(status, message) {
  this.status(status)
  .json({status, message})
}

router.post('/events/:name/:uid', (req, res, next) => {
  if (req.params.uid.indexOf('*') !== -1) {
    return jsonError.call(res, 400, 'uid cannot contain wildcard')
  }

  const attr = {
    uid: req.params.uid,
    name: req.params.name,
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
      return jsonError.call(res, 404, 'Not found')
    }
  })
  .catch(error => {
    return jsonError.call(res, 500, error)
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
    return jsonError.call(res, 500, error)
  })
})

export default router
