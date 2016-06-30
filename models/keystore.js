'use strict';
module.exports = function (sequelize, Sequelize) {
  var Keystore = sequelize.define('keystore', {
    key  : {
      type      : Sequelize.STRING,
      notNull  : false,
      primaryKey: true,
      unique    : true
    },
    value: {
      type    : Sequelize.STRING(1024)
    }
  });

  return Keystore;
};
