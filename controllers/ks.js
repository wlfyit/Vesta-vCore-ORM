'use strict';

module.exports = function (ks) {

  var ksController = {};

  ksController.postKs = function (req, res) {
    console.log(req.body);
    ks.set(req.body.key, req.body.value, function (err, key) {
      if (err) {
        res.status(400);
        return res.json(err);
      }

      return res.json(key);
    });
  };
  ksController.postToKs = function (req, res) {
    if (req.body.key == req.params.key) {
      ks.set(req.body.key, req.body.value, function (err, key) {
        if (err) {
          res.status(400);
          return res.json(err);
        }

        return res.json(key);
      });
    }
    else {
      res.status(400);
      return res.json({
        "name": "ParameterMismatchError",
        "message": "Parameter Mismatch: 'key' in body must match uri"
      });
    }
  };
  ksController.getKs  = function (req, res) {
    if (req.query.key) {
      ks.get(req.query.key, function (err, key) {
        if (err) {
          res.status(400);
          return res.json(err);
        }

        if (key == false) {
          res.status(404);
          return res.json({
            "name": "NotFoundError"
          });
        }

        return res.json(key);
      });
    }
    else {
      res.status(400);
      return res.json({
        "name": "MissingParameterError",
        "message": "Missing Parameter: 'key' must be defined in query"
      });
    }
  };
  ksController.getToKs  = function (req, res) {
    ks.get(req.params.key, function (err, key) {
      if (err) {
        res.status(400);
        return res.json(err);
      }

      if (key == false) {
        res.status(404);
        return res.json({
          "name": "NotFoundError"
        });
      }

      return res.json(key);
    });
  };

  return ksController;
};
