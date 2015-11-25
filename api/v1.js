import express from 'express'
/*
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
*/

const router = express.Router()

/*
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: false}))
router.use(cookieParser())
*/

router.get('/events', (req, res, next) => {
  res.json([])
})

export default router
