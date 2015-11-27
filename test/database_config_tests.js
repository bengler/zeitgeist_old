import {assert} from 'chai'
import databaseConfig from '../lib/databaseConfig'
import path from 'path'

const yamlConfig = path.resolve(__dirname, 'fixtures/database.yml')

describe('databaseConfig', () => {
  it('translates from ActiveRecord YML to Sequelize JSON', () => {
    const jsonConfig = databaseConfig(yamlConfig)
    assert.deepEqual(jsonConfig, {
      test: {
        username: 'zeitgeist',
        password: 'password',
        database: 'zeitgeist_test',
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        pool: {
          maxConnections: 5,
          minConnections: 5
        }
      }
    })
  })
})
