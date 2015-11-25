import express from 'express'
const router = express.Router()

router.get('/events', (req, res, next) => {
  res.json('rune')
})

export default router
