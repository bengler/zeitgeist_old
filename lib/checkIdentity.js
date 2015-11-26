const cookieName = 'checkpoint:session'

function makeCheckIdentity(checkFunction) {

  function checkIdentity(req, res, next) {
    const sessionId = req.query.session || req.cookies[cookieName]

    if (!sessionId) {
      return res.status(401).end()
    }

    if (!checkFunction) {
      // We have no way of checking the identity, so just pass
      return next()
    }

    checkFunction(sessionId)
    .then(identity => {
      if (!identity) {
        return res.status(401).end()
      }
      res.locals.checkpointIdentity = identity
      next()
    })
    .catch(error => {
      next(error)
    })
  }

  return checkIdentity
}

export default makeCheckIdentity
