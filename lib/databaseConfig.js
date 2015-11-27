import yaml from 'yamljs'

// Translates from ActiveRecord database.yml
// to Sequelize database.json
function databaseConfig(ymlPath) {
  const yml = yaml.load(ymlPath)
  const result = {}
  Object.keys(yml).forEach(env => {
    const config = {}
    let dialect = yml[env].adapter
    if (dialect === 'postgresql') {
      dialect = 'postgres'
    }
    config.dialect = dialect
    config.database = yml[env].database
    config.host = yml[env].host
    config.port = yml[env].port
    config.username = yml[env].username
    config.password = yml[env].password
    if (yml[env].pool) {
      config.pool = {
        maxConnections: yml[env].pool,
        minConnections: yml[env].pool,
      }
    }
    result[env] = config
  })
  return result
}

export default databaseConfig
