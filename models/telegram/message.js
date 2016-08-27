'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramMessage = sequelize.define('telegram_message', {
    message_id          : {
      type      : Sequelize.INTEGER,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    date                : {
      type     : Sequelize.DATE,
      allowNull: false
    },
    forward_date        : {
      type: Sequelize.DATE
    },
    edit_date           : {
      type: Sequelize.DATE
    },
    text                : {
      type: Sequelize.STRING(4096)
    },
    caption             : {
      type: Sequelize.STRING
    },
    new_chat_title      : {
      type: Sequelize.STRING
    },
    delete_chat_photo   : {
      type: Sequelize.BOOLEAN
    },
    channel_chat_created: {
      type: Sequelize.BOOLEAN
    },
    migrate_to_chat_id  : {
      type: Sequelize.INTEGER
    },
    migrate_from_chat_id: {
      type: Sequelize.INTEGER
    }
  });

  return TelegramMessage;
};
