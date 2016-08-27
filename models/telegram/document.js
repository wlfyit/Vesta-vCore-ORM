'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramDocument = sequelize.define('telegram_document', {
    file_id  : {
      type      : Sequelize.STRING,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    file_name: {
      type: Sequelize.STRING
    },
    mime_type: {
      type: Sequelize.STRING
    },
    file_size: {
      type: Sequelize.INTEGER
    }
  });

  return TelegramDocument;
};
