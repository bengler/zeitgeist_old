import repl from 'repl'
import models from './models'
import defaults from './config'
import sequelize from 'sequelize'

const replServer = repl.start({
  prompt: `zeitgeist ${defaults.env}> `,
})

require('repl.history')(replServer, process.env.HOME + '/.node_history')
replServer.context.models = models
replServer.context.sequelize = sequelize
