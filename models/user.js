'use strict';

var bcrypt = require('bcrypt');

module.exports = function (sequelize, Sequelize) {
  var User = sequelize.define('user', {
    username     : {
      type      : Sequelize.STRING,
      unique    : true,
      primaryKey: true,
      allowNull : false,
      validate  : {
        is: /^[a-z0-9\-_]+$/i
      }
    },
    password_hash: {
      type     : Sequelize.STRING,
      allowNull: false,
      validate : {
        is: /^\$2[aby]\$\d\d\$.{53}$/i
      }
    },
    password     : {
      type: Sequelize.VIRTUAL,
      allowNull: false,
      set : function (val) {
        var salt = bcrypt.genSaltSync(12);
        var hash = bcrypt.hashSync(val, salt);

        this.setDataValue('password', val);
        this.setDataValue('password_hash', hash);
      }
    },
    email        : {
      type     : Sequelize.STRING,
      allowNull: false,
      validate : {
        isEmail: true
      }
    }
  });

  return User;
};
