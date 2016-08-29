'use strict';
var https = require('https');


module.exports = function (logger, cache, ks) {

  var cachePrefix            = 'weather:',
      cacheExpiration        = 21600, // 6 hours in seconds
      freshnessCheckInterval = 300, // 5 minutes in seconds
      freshnessAge           = 1200; // 20 hour in seconds

  var weatherController = {};

  weatherController._parseData = function (data) {

    cache.set(cachePrefix + 'lastresponse', data, {ttl: cacheExpiration});

    var weatherData = null;
    try {
      weatherData = JSON.parse(data);
    }
    catch (e) {
      logger.error('weather JSON packet is malformed')
    }
    finally {
      if (weatherData !== null) {
        var keys = Object.keys(weatherData);
        keys.forEach(function (element, index, array) {
          var value = JSON.stringify(weatherData[element]);
          logger.debug('caching weather data: ' + element);
          cache.set(cachePrefix + element, value);
        })
      }
    }
  };

  weatherController._updateData = function () {
    ks.get('config:weather:apiKey', function (err, result) {
      var wuKey = result['value'];

      ks.get('config:weather:location', function (err, result) {
        var location = result['value'];
        var wuURL    = 'https://api.wunderground.com/api/' + wuKey +
          '/alerts/astronomy/conditions/currenthurricane/forecast10day/hourly10day/satellite/webcams/q/' +
          location + '.json';

        logger.debug('trying url: ' + wuURL);

        https.get(wuURL, function (res) {
          var body = '';

          res.on('data', function (chunk) {
            body += chunk;
          });

          res.on('end', function () {
            logger.debug('got weather response');
            weatherController._parseData(body)
          })
        }).on('error', function (e) {
          logger.error('could not retrieve weather data', e);
        })
      })
    })
  };

  weatherController._checkFreshness = function () {
    var result = cache.get(cachePrefix + 'current_observation',function (err, result){
      console.log(result);

      if (result == null) {
        logger.debug('no current weather data. refreshing');
        weatherController._updateData();
      }
      else {
        logger.debug('checking weather data freshness');
        var weatherData = JSON.parse(result);
        var d           = new Date();
        var seconds     = Math.round(d.getTime() / 1000);

        // get
        if (Math.round(weatherData.local_epoch) + freshnessAge > seconds) {
          logger.debug('weather data is fresh');
        }
        else {
          logger.debug('weather data is not fresh. refreshing');
          weatherController._updateData();
        }
      }

    });
  };

  weatherController.routeGet = function (req, res) {
    var datatype = req.params.datatype;
    if (datatype.match(/^(alerts|current_observation|currenthurricane|forecast|hourly_forecast|lastresponse|moon_phase|query_zone|response|satellite|sun_phase|webcams)$/g)) {
      cache.get(cachePrefix + datatype, function (err, result) {
        if (result !== null) {
          res.send(JSON.parse(result));
        } else {
          res.status(404);
          res.send({'status': 404, 'error': 'Weather data not found.'});
        }
      })
    }
    else {
      res.status(400);
      res.send({'status': 400, 'error': 'Unkown weather data type.'});
    }
  };

  // Schedule Freshness Checks
  setImmediate(weatherController._checkFreshness);
  setInterval(weatherController._checkFreshness, freshnessCheckInterval * 1000);

  return weatherController;
};
