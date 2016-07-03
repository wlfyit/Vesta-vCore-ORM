'use strict';
var SequelizeTokenify = require('sequelize-tokenify');

module.exports = function (sequelize, Sequelize) {
  var OAuthToken = sequelize.define('oauth_token', {
    value: {
      type     : Sequelize.STRING,
      unique   : true,
      allowNull: false
    }
  });

  SequelizeTokenify.tokenify(OAuthToken, {
    field : 'value',
    length: 32
  });

  return OAuthToken;
};
