'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramVenue = sequelize.define('telegram_venue', {
    id       : {
      type         : Sequelize.INTEGER,
      unique       : true,
      primaryKey   : true,
      allowNull    : false,
      autoIncrement: true
    },
    title  : {
      type      : Sequelize.STRING,
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
