'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramChat = sequelize.define('telegram_chat', {
    id        : {
      type      : Sequelize.BIGINT,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    type      : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    title     : {
      type: Sequelize.STRING
    },
    first_name: {
      type: Sequelize.STRING
    },
    last_name : {
      type: Sequelize.STRING
    },
    username  : {
      type: Sequelize.STRING
    }
  });

  return TelegramChat;
};
