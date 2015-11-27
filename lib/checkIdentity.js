const cookieName = 'checkpoint:session'
import config from '../config'

function makeCheckIdentity(checkFunction) {

  function checkIdentity(req, res, next) {
    const sessionId = req.query.session || req.cookies[cookieName]

    if (!sessionId) {
      if (config.env === 'staging') {
        return res.status(401).json({
          query: req.query,
          cookies: req.cookies,
          sessionId: sessionId,
          error: 'No sessionId variable'
        })
      }
      return res.status(401).send('No current identity.').end()
    }

    if (!checkFunction) {
      // We have no way of checking the identity, so just pass
      return next()
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`
    checkFunction(baseUrl, sessionId)
    .then(identity => {
      res.locals.checkpointIdentity = identity
      next()
    })
    .catch(error => {
      if (config.env === 'staging') {
        return res.status(401).json({
          query: req.query,
          cookies: req.cookies,
          sessionId: sessionId,
          error: error
        })
      }
      return res.status(401).send('No current identity.').end()
    })
  }

  return checkIdentity
}

export default makeCheckIdentity
