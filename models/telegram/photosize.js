'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramPhotoSize = sequelize.define('telegram_photosize', {
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
    file_path: {
      type: Sequelize.STRING
    },
    file_size: {
      type: Sequelize.INTEGER
    }
  });

  return TelegramPhotoSize;
};
