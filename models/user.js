'use strict';

module.exports = function (sequelize, Sequelize) {
  var User = sequelize.define('user', {
    username: {
      type     : Sequelize.STRING,
      unique   : true,
      allowNull: false,
      validate: {
        is: /^[a-z0-9\-_]+$/i
      }
    },
    password: {
      type     : Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^\$2[aby]\$\d\d\$.{53}$/i
      }
    },
    email   : {
      type     : Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    }
  });

  return User;
};
