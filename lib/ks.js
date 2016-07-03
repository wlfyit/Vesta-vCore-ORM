'use strict';
module.exports = function (cache, Keystore) {
  var cachePrefix = 'cache:ks:',
      cacheTtl    = 300;

  var ksLib = {};

  ksLib.get = function (key, callback) {
    cache.wrap(cachePrefix + key, function (cacheCallback) {
      Keystore.findOne({
        where: {
          key: key
        }
      }).then(function (key) {
        if (!key) {
          return cacheCallback(null, false);
        }

        return cacheCallback(null, key.get({plain: true}));
      })
    }, {ttl: cacheTtl}, callback);
  };

  ksLib.set = function (key, value, callback) {
    Keystore.findOne({
      where: {
        key: key
      }
    }).then(function (dbKey) {
      if (!dbKey) {
        var newKey = {
          key  : key,
          value: value
        };

        Keystore.create(newKey).then(function (resKey) {
          return callback(null, resKey.get({plain: true}));
        }).catch(function (error) {
          return callback(error);
        });
      }
      else {
        dbKey.update({
          value: value
        }).then(function() {
          return callback(null, dbKey.get({plain: true}));
        }).catch(function (error) {
          return callback(error);
        });

      }
    })
  };

  ksLib.del = function (key) {

  };

  return ksLib;
};