'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramVideo = sequelize.define('telegram_video', {
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
    duration : {
      type     : Sequelize.INTEGER,
      allowNull: false
    },
    mime_type: {
      type: Sequelize.STRING
    },
    file_size: {
      type: Sequelize.INTEGER
    }
  });

  return TelegramVideo;
};
