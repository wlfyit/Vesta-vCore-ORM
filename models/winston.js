'use strict';

module.exports = function (sequelize, Sequelize) {
  var WinstonLogs = sequelize.define('winston_logs', {
    id     : {
      type      : Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    ts: {
      type     : Sequelize.STRING
    },
    level        : {
      type     : Sequelize.STRING
    },
    msg        : {
      type     : Sequelize.BLOB
    },
    meta        : {
      type     : Sequelize.JSON
    }
  });

  return WinstonLogs;
};
