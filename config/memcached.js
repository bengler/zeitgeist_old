var fs = require('fs')
var Memcached = require('memcached')

var githead = fs.readFileSync('./../.githead').toString()
var servers = [
  'localhost:11211',
]
var options = {
  namespace: 'zeitgeist:' + githead.substr(0, 6) + ':',
  maxExpiration: 24 * 60 * 60,
  poolSize: 16,
  reconnect: 30 * 1000,
  retry: 30 * 1000,
  timeout: 3 * 1000,
  idle: 300 * 1000,
  retries: 3,
  failures: 3
}

module.exports = new Memcached(servers, options)

