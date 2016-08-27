'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramMessageEntity = sequelize.define('telegram_messageentity', {
    id    : {
      type      : Sequelize.UUID,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    type  : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    offset: {
      type     : Sequelize.INTEGER,
      allowNull: false
    },
    length: {
      type     : Sequelize.INTEGER,
      allowNull: false
    },
    url   : {
      type: Sequelize.STRING
    }
  });

  return TelegramMessageEntity;
};
