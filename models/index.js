import winston from 'winston'
import databaseConfig from '../lib/databaseConfig'
/* eslint-disable */
'use strict';

var defaults = require('../config/index.js').default

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = defaults.env;
var config    = databaseConfig(__dirname + '/../config/database.yml')[env];
var db        = {};

if (env === 'development' || env === 'test') {
  const logFile = `log/database-${env}.log`
  const logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({filename: logFile})
    ]
  })
  config.logging = logger.info
} else {
  config.logging = console.log
}

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
/* eslint-enable */
