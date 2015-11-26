/* eslint-disable no-process-env */
import defaults from 'defaults'

const env = process.env.NODE_ENV || 'development'

const DEFAULTS = {
  port: 3000
}

if (env === 'development') {
  DEFAULTS.pebbleHost = 'http://thestream.staging.o5.no'
}

export default defaults({
  env,
  port: process.env.PORT,
  showDebug: process.env.DEBUG
}, DEFAULTS)
/* eslint-enable no-process-env */
