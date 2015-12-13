import Memcached from 'memcached'

const server = 'localhost:11211'
const options = {
  namespace: 'zeitgeist:dev:'
}

export default new Memcached(server, options)

