import config from '../config'
const backtrackEnvs = ['development', 'test', 'staging']
export default function jsonError(status = 500, error) {
  const displayedError = backtrackEnvs.indexOf(config.env) > -1 ? error : {}
  return this.status(status).json(
    {
      status,
      message: error.message,
      error: displayedError
    }
  )
}
