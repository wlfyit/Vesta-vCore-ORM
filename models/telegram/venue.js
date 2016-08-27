'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramVenue = sequelize.define('telegram_venue', {
    title  : {
      type      : Sequelize.STRING,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    address : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    foursquare_id: {
      type: Sequelize.STRING
    }
  });

  return TelegramVenue;
};
