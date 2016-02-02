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
    defaultScope: {
      where: {
        deleted: false
      }
    },
    scopes: {
      countByUidAndField: function(uid, field) {
        return {
          attributes: [[sequelize.json('DISTINCT document.time'), 'id']],
          group: ['uid']
        }
      },
      countByUid: function(name) {
        return {
          attributes: ['uid', [sequelize.fn('count', sequelize.col('uid')), 'count']],
          group: ['uid']
        }
      }
    },
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Event;
};
/* eslint-enable */
