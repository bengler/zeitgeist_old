/* eslint-disable */
'use strict';
module.exports = function(sequelize, DataTypes) {
  var Event = sequelize.define('Event', {
    uid: DataTypes.STRING,
    name: DataTypes.STRING,
    identity: DataTypes.JSONB,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    document: DataTypes.JSONB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Event;
};
/* eslint-enable */
