'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramUser = sequelize.define('telegram_user', {
    id        : {
      type      : Sequelize.INTEGER,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    first_name: {
      type     : Sequelize.STRING,
      allowNull: false
    },
    last_name : {
      type: Sequelize.STRING
    },
    username  : {
      type: Sequelize.STRING
    }
  });

  return TelegramUser;
};
