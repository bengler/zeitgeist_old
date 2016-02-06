'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.query('CREATE INDEX CONCURRENTLY "Events_name" ON "Events" ( "name" )')
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.query('DROP INDEX CONCURRENTLY IF EXISTS "Events_name"')
  }
};
