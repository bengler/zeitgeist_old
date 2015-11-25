import defaults from 'defaults'

const env = process.env.NODE_ENV || 'development'

const DEFAULTS = {
  port: 3000
}

export default defaults({
  env,
  port: process.env.PORT,
  showDebug: process.env.DEBUG
}, DEFAULTS)

