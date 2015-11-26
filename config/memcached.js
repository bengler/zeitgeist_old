var Memcached = require('memcached');
var server = 'localhost:11211';
var options = {
  namespace: 'zeitgeist:dev:'
};

module.exports = new Memcached(server, options)

