'use strict';
var SequelizeTokenify = require('sequelize-tokenify');

module.exports = function (sequelize, Sequelize) {
  var OAuthCode = sequelize.define('oauth_code', {
    value      : {
      type     : Sequelize.STRING,
      unique   : true,
      allowNull: false
    },
    redirectUri: {
      type     : Sequelize.STRING,
      allowNull: false,
      validate : {
        isUrl: true
      }
    }
  });

  SequelizeTokenify.tokenify(OAuthCode, {
    field : 'value',
    length: 32
  });

  return OAuthCode;
};
