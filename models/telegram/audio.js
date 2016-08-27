'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramAudio = sequelize.define('telegram_audio', {
    file_id  : {
      type      : Sequelize.STRING,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    duration : {
      type     : Sequelize.INTEGER,
      allowNull: false
    },
    performer: {
      type: Sequelize.STRING
    },
    title    : {
      type: Sequelize.STRING
    },
    mime_type: {
      type: Sequelize.STRING
    },
    file_size: {
      type: Sequelize.INTEGER
    }
  });

  return TelegramAudio;
};
