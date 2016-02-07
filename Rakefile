require 'yaml'
require File.expand_path('config/site.rb') if File.exists?('config/site.rb')

namespace :db  do
  desc 'Run migrations'
  task :migrate do
    env = ENV['RACK_ENV'] || 'development'
    config = YAML.load_file('config/database.yml')[env]
    url = "#{config['adapter']}://#{config['username']}:#{config['password']}@#{config['host']}/#{config['database']}'"
    puts `$(npm bin)/sequelize db:migrate --url #{url}'`
  end
end

namespace :migration do
  desc 'Create migration'
  task :create do
    env = ENV['RACK_ENV'] || 'development'
    config = YAML.load_file('config/database.yml')[env]
    url = "#{config['adapter']}://#{config['username']}:#{config['password']}@#{config['host']}/#{config['database']}'"
    puts `$(npm bin)/sequelize migration:create --url #{url}'`
  end

  desc 'Rollback'
  task :rollback do
    env = ENV['RACK_ENV'] || 'development'
    config = YAML.load_file('config/database.yml')[env]
    url = "#{config['adapter']}://#{config['username']}:#{config['password']}@#{config['host']}/#{config['database']}'"
    puts `$(npm bin)/sequelize db:migrate:undo --url #{url}'`
  end
end
