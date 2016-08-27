'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramSticker = sequelize.define('telegram_sticker', {
    file_id  : {
      type      : Sequelize.STRING,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    width    : {
      type     : Sequelize.INTEGER,
      allowNull: false
    },
    height   : {
      type     : Sequelize.INTEGER,
      allowNull: false
    },
    emoji    : {
      type: Sequelize.STRING
    },
    file_size: {
      type: Sequelize.INTEGER
    }
  });

  return TelegramSticker;
};
