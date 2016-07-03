'use strict';
module.exports = function (sequelize, Sequelize) {
  var Keystore = sequelize.define('keystore', {
    key  : {
      type      : Sequelize.STRING,
      notNull  : false,
      primaryKey: true,
      unique    : true,
      validate: {
        is: /^[a-z0-9\-_:]+$/i
      }
    },
    value: {
      type    : Sequelize.TEXT
    }
  });

  return Keystore;
};
