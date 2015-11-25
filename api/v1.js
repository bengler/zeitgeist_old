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

router.post('/events/:uid', (req, res, next) => {
  const uid = req.params.uid
  models.Event.create({
    uid,
    name: req.body.name,
    document: req.body.document
  })
  .then(event => {
    res
    .header('Location', `${req.originalUrl}/${event.id}`)
    .status(201)
    .json('Created')
  })
})

router.get('/events/:uid/:name', (req, res, next) => {
  models.Event.findAndCountAll({
    where: {
      uid: req.params.uid,
      name: req.params.name
    }
  })
  .then(queryResult => {
    res
    .status(200)
    .json(queryResult)
  })
})

export default router
