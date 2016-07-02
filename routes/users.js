var express = require('express');
var router = express.Router();

module.exports = function () {

  router.get('/:username', function (req, res) {
    auth.routeGetUser(req.params.user_id , req, res);
  });

  return router;
};
