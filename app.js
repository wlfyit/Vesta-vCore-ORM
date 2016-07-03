'use strict';
// Load Modules
var bcrypt            = require('bcrypt');
var bodyParser        = require('body-parser'),
    cacheManager      = require('cache-manager'),
    cookieParser      = require('cookie-parser'),
    express           = require('express'),
    expressSession    = require('express-session'),
    logger            = require('morgan'),
    passport          = require('passport'),
    path              = require('path'),
    redisStore        = require('cache-manager-redis'),
    RedisSessionStore = require('connect-redis')(expressSession),
    Sequelize         = require('sequelize');

// Load Config
var config = require('./config');

// Init Caching 
var redisOpts  = config.redis || {};
var redisCache = cacheManager.caching({
  store: redisStore,
  host : redisOpts.host || 'localhost',
  port : redisOpts.port || 6379,
  db   : redisOpts.db || 0,
  ttl  : redisOpts.cacheTtl || 3600 // 5 minutes in seconds
});

// Init DB
var sequelize = new Sequelize(config.pg, {
  native: true // SSL Support
});

// Test Connection
sequelize
  .authenticate()
  .then(function (err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

var Keystore = require('./models/keystore')(sequelize, Sequelize);
var Phrase   = require('./models/phrase')(sequelize, Sequelize);
var User     = require('./models/user')(sequelize, Sequelize);

var OAuthClient = require('./models/oauth/client')(sequelize, Sequelize);
OAuthClient.belongsTo(User);

var OAuthCode = require('./models/oauth/code')(sequelize, Sequelize);
OAuthCode.belongsTo(User);
OAuthCode.belongsTo(OAuthClient);

var OAuthToken = require('./models/oauth/token')(sequelize, Sequelize);
OAuthToken.belongsTo(User);
OAuthToken.belongsTo(OAuthClient);

sequelize.sync();

// Load Libraries
var ks = require('./lib/ks')(redisCache, Keystore);

// Load Controllers
var ksController   = require('./controllers/ks')(ks);
var userController = require('./controllers/user')(redisCache, User, OAuthClient, OAuthCode, OAuthToken);

// Load Routes
var routes = require('./routes/index'),
    users  = require('./routes/users');

// Start Application
var app = express();

app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// Configuring Passport
app.use(expressSession({
  store            : new RedisSessionStore({
    host: redisOpts.host || 'localhost',
    port: redisOpts.port || 6379,
    db  : redisOpts.db || 0,
    ttl : redisOpts.sessionTtl || 86400 // 24 hours in seconds
  }),
  secret           : config.vesta.secret,
  saveUninitialized: true,
  resave           : true
}));
app.use(passport.initialize());
app.use(passport.session());

// api
var apiRouter = express.Router();

apiRouter.route('/oauth/client')
  .post(userController.isAuthenticated, userController.postClients)
  .get(userController.isAuthenticated, userController.getClients);

apiRouter.route('/keystore')
  .post(userController.isAuthenticated, ksController.postKs)
  .put(userController.isAuthenticated, ksController.postKs)
  .get(userController.isAuthenticated, ksController.getKs);

apiRouter.route('/keystore/:key')
  .post(userController.isAuthenticated, ksController.postToKs)
  .put(userController.isAuthenticated, ksController.postToKs)
  .get(userController.isAuthenticated, ksController.getToKs);

apiRouter.route('/users')
  .post(userController.isAuthenticated, userController.postUsers)
  .get(userController.isAuthenticated, userController.getUsers);

apiRouter.route('/users/:username')
//.post(userController.postUser)
  .get(userController.isAuthenticated, userController.getUser);

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err    = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error  : err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error  : {}
  });
});


module.exports = app;
