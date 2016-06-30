'use strict';
var SequelizeTokenify = require('sequelize-tokenify');

module.exports = function (sequelize, Sequelize) {
  var Phrase = sequelize.define('phrase', {
    voice    : {
      type: Sequelize.STRING
    },
    gender   : {
      type: Sequelize.STRING
    },
    language : {
      type: Sequelize.STRING
    },
    text     : {
      type: Sequelize.STRING.BINARY
    },
    file     : {
      type: Sequelize.BLOB
    },
    mime     : {
      type: Sequelize.STRING
    },
    voicehash: {
      type  : Sequelize.STRING,
      unique: true
    }
  });

  SequelizeTokenify.tokenify(Phrase, {
    field: 'voicehash'
  });

  return Phrase;
};
