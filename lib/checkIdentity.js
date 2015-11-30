import config from '../config'
import makeCheckpoint from './createCheckpoint'
const cookieName = 'checkpoint.session'

const checkpointChecker = (baseUrl, sessionId) => {
  return new Promise((resolve, reject) => {
    const base = config.pebbleHost || baseUrl
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

function makeCheckIdentity(checkFunction = checkpointChecker) {

  const checker = checkFunction
  function checkIdentity(req, res, next) {
    const sessionId = req.query.session || req.cookies[cookieName]

    if (!sessionId) {
      const identError = new Error('No current identity (local)')
      identError.status = 401
      return next(identError)
    }

    if (!checker) {
      // We have no way of checking the identity, so just pass
      return next()
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`
    checker(baseUrl, sessionId)
    .then(identity => {
      res.locals.checkpointIdentity = identity
      next()
    })
    .catch(() => {
      const identError = new Error('No current identity (function)')
      identError.status = 401
      return next(identError)
    })
  }

  return checkIdentity
}

export default makeCheckIdentity
