'use strict';

var BasicStrategy  = require('passport-http').BasicStrategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    bcrypt         = require('bcrypt'),
    passport       = require('passport'),
    validator      = require('validator');

module.exports = function (cache, User, OAuthClient, OAuthCode, OAuthToken) {
  var cachePrefixClient = 'cache:oauthclient:',
      cachePrefixUser   = 'cache:user:',
      cacheTtl          = 300,
      saltRounds        = 12;

  var userController = {};

  // Authentication

  passport.use(new BasicStrategy(
    function (username, password, callback) {
      cache.wrap(cachePrefixUser + username, function (cacheCallback) {
        User.findOne({
          where: {
            username: username
          }
        }).then(function (user) {
          if (!user) {
            return cacheCallback(null, false);
          }

          // Load hash from DB.
          bcrypt.compare(password, user.password_hash, function (err, isMatch) {
            if (err) {
              return cacheCallback(err);
            }

            // Password did not match
            if (!isMatch) {
              return cacheCallback(null, false);
            }

            // Success
            return cacheCallback(null, user.get({plain: true}));
          })
        })
      }, {ttl: cacheTtl}, callback);
    }
  ));
  userController.isAuthenticated = passport.authenticate('basic', {session: false});

  passport.use('client-basic', new BasicStrategy(
    function (username, password, callback) {
      cache.wrap(cachePrefixClient + username, function (cacheCallback) {
        OAuthClient.findOne({
          where: {
            name: username
          }
        }).then(function (client) {
          // No client found with that id
          if (!client) {
            return callback(null, false);
          }

          // Load hash from DB.
          bcrypt.compare(password, client.secret, function (err, isMatch) {
            if (err) {
              return cacheCallback(err);
            }

            // Password did not match
            if (!isMatch) {
              return cacheCallback(null, false);
            }

            // Success
            return cacheCallback(null, client);
          })
        })
      }, {ttl: cacheTtl}, callback)
    }
  ));
  userController.isClientAuthenticated = passport.authenticate('client-basic', {session: false});

  passport.use(new BearerStrategy(
    function (accessToken, callback) {
      OAuthToken.findOne({
        where: {
          value: accessToken
        }
      }).then(function (token) {
        // No client found with that id
        if (!token) {
          return callback(null, false);
        }

        User.findOne({
          where: {
            id: token.userId
          }
        }).then(function (user) {
          // Simple example with no scope
          callback(null, user, {scope: '*'});
        })
      })
    }
  ));
  userController.isBearerAuthenticated = passport.authenticate('bearer', { session: false });

  // User Resource

  userController.postUsers = function (req, res) {
    var passValidation = req.body.password || '';
    if (passValidation.length > 7) {
      var user = {
        username: req.body.username,
        password: req.body.password,
        email   : req.body.email
      };

      User.create(user).then(function (user) {
        return res.json(user);
      }).catch(function (error) {
        res.status(400);
        return res.json(error);
      });
    }
    else {
      res.status(400);
      return res.json({
        "name"   : "SequelizeUniqueConstraintError",
        "message": "Validation error",
        "errors" : [
          {
            "message": "password must be longer than 7 characters",
            "path"   : "password"
          }
        ]
      })
    }
  };

  userController.getUser = function (req, res) {
    User.findOne({
      username: req.params.username
    }).then(function (user) {
      res.json(user);
    })
  };

  userController.getUsers = function (req, res) {
    User.findAll().then(function (users) {
      res.json(users);
    })
  };

  // OAuth Client Resource

  userController.postClients = function (req, res) {
    bcrypt.hash(req.body.secret, saltRounds, function (err, hash) {
      var client = {
        name  : req.body.name || '',
        secret: hash,
        userId: req.user.id
      };

      OAuthClient.create(client).then(function (client) {
        return res.json(client);
      }).catch(function (error) {
        res.status(400);
        return res.json(error);
      });

    });
  };

  // Create endpoint /api/clients for GET
  userController.getClients = function (req, res) {
    OAuthClient.findAll().then(function (clients) {
      res.json(clients);
    });
  };

  return userController;
};
