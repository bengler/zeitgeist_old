import express from 'express'
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
  res
  .header('Location', `${req.originalUrl}/todo`)
  .status(201)
  .json('Created')
})

export default router
