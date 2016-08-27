'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramVoice = sequelize.define('telegram_voice', {
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
    mime_type: {
      type: Sequelize.STRING
    },
    file_size: {
      type: Sequelize.INTEGER
    }
  });

  return TelegramVoice;
};
