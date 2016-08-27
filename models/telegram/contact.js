'use strict';

module.exports = function (sequelize, Sequelize) {
  var TelegramContact = sequelize.define('telegram_contact', {
    phone_number: {
      type      : Sequelize.STRING,
      unique    : true,
      primaryKey: true,
      allowNull : false
    },
    first_name  : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    last_name   : {
      type: Sequelize.STRING
    }
  });

  return TelegramContact;
};
