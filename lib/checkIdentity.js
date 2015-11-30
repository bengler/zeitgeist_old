const cookieName = 'checkpoint.session'
import config from '../config'

function makeCheckIdentity(checkFunction) {

  const checker = checkFunction
  function checkIdentity(req, res, next) {
    let sessionId = req.cookies[cookieName]
    if (!sessionId || sessionId === '') {
      sessionId = req.query.session
    }

    if (!sessionId) {
      return res.status(401).send('No current identity.').end()
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
    .catch(error => {
      return res.status(401).send('No current identity.').end()
    })
  }

  return checkIdentity
}

export default makeCheckIdentity
