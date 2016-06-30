'use strict';

module.exports = function (sequelize, Sequelize) {
  var OAuthToken = sequelize.define('oauth_token', {
    value: {
      type     : Sequelize.STRING,
      unique   : true,
      allowNull: false
    }
  });

  return OAuthToken;
};
