require 'yaml'

namespace :db  do
  desc 'Run migrations'
  task :migrate do
    env = ENV['NODE_ENV'] || 'development'
    config = YAML.load_file('config/database.yml')[env]
    url = "#{config['adapter']}://#{config['username']}:#{config['password']}@#{config['host']}/#{config['database']}'"
    puts `$(npm bin)/sequelize db:migrate --url #{url}'`
  end
end
