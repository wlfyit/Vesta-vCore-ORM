'use strict';

module.exports = function (sequelize, Sequelize) {
  var OAuthClient = sequelize.define('oauth_client', {
    name  : {
      type     : Sequelize.STRING,
      unique   : true,
      allowNull: false
    },
    secret: {
      type     : Sequelize.STRING,
      allowNull: false
    }
  });

  return OAuthClient;
};
