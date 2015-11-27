const cookieName = 'checkpoint:session'

function makeCheckIdentity(checkFunction) {

  function checkIdentity(req, res, next) {
    const sessionId = req.query.session || req.cookies[cookieName]

    if (!sessionId) {
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
      return res.status(401).send('No current identity.').end()
    })
  }

  return checkIdentity
}

export default makeCheckIdentity
