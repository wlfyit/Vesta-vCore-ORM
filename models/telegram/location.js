'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramLocation = sequelize.define('telegram_location', {
    id       : {
      type      : Sequelize.UUID,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    longitude: {
      type     : Sequelize.FLOAT,
      allowNull: false
    },
    latitude : {
      type     : Sequelize.FLOAT,
      allowNull: false
    }
  });

  return TelegramLocation;
};
