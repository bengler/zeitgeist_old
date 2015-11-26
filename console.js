import repl from 'repl'
import models from './models'
import defaults from './config'
import sequelize from 'sequelize'
import replHistory from 'repl.history'
import Uid from '@bengler/pebbles-uid'
import memcached from 'config/memcached'

const replServer = repl.start({
  prompt: `zeitgeist ${defaults.env}> `,
})

replHistory(replServer, `${process.env.HOME}/.node_history`) // eslint-disable-line no-process-env
replServer.context.models = models
replServer.context.sequelize = sequelize
replServer.context.Uid = Uid
replServer.context.memcached = memcached
