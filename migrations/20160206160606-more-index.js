'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addIndex(
      'Events',
      ['name'],
      {
        indexName: 'Events_name'
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex('Events', 'Events_name')
  }
};
