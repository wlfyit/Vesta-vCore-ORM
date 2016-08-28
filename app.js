'use strict';
// Load Modules
var bcrypt            = require('bcrypt');
var bodyParser        = require('body-parser'),
    cacheManager      = require('cache-manager'),
    cookieParser      = require('cookie-parser'),
    express           = require('express'),
    expressSession    = require('express-session'),
    morgan            = require('morgan'),
    passport          = require('passport'),
    path              = require('path'),
    redisStore        = require('cache-manager-redis'),
    RedisSessionStore = require('connect-redis')(expressSession),
    Sequelize         = require('sequelize'),
    winston           = require('winston');

// Load Config
var config = require('./config');

// init Logging
var logger = new (winston.Logger)({
  transports: [
    new (require("winston-postgresql").PostgreSQL)({
      "connString": config.pg,
      "tableName" : "winston_logs",
      "level"     : "debug"
    }),
    new (winston.transports.Console)({
      colorize: true,
      level   : 'debug'
    })
  ]
});

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
  define: {
    paranoid: true
  },
  native: true // SSL Support,
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

// OAuth
var OAuthClient = require('./models/oauth/client')(sequelize, Sequelize);
OAuthClient.belongsTo(User);

var OAuthCode = require('./models/oauth/code')(sequelize, Sequelize);
OAuthCode.belongsTo(User);
OAuthCode.belongsTo(OAuthClient);

var OAuthToken = require('./models/oauth/token')(sequelize, Sequelize);
OAuthToken.belongsTo(User);
OAuthToken.belongsTo(OAuthClient);

// Telegram
var TelegramAudio     = require('./models/telegram/audio')(sequelize, Sequelize);
var TelegramChat      = require('./models/telegram/chat')(sequelize, Sequelize);
var TelegramContact   = require('./models/telegram/contact')(sequelize, Sequelize);
var TelegramLocation  = require('./models/telegram/location')(sequelize, Sequelize);
var TelegramPhotoSize = require('./models/telegram/photosize')(sequelize, Sequelize);
var TelegramUser      = require('./models/telegram/user')(sequelize, Sequelize);
var TelegramVoice     = require('./models/telegram/voice')(sequelize, Sequelize);

var TelegramDocument = require('./models/telegram/document')(sequelize, Sequelize);
TelegramDocument.belongsTo(TelegramPhotoSize, {as: 'Thumb'});

var TelegramSticker = require('./models/telegram/sticker')(sequelize, Sequelize);
TelegramSticker.belongsTo(TelegramPhotoSize, {as: 'Thumb'});

var TelegramMessageEntity = require('./models/telegram/messageentity')(sequelize, Sequelize);
TelegramMessageEntity.belongsTo(TelegramUser, {as: 'User'});

var TelegramVenue = require('./models/telegram/venue')(sequelize, Sequelize);
TelegramVenue.belongsTo(TelegramLocation, {as: 'Location'});

var TelegramVideo = require('./models/telegram/video')(sequelize, Sequelize);
TelegramVideo.belongsTo(TelegramPhotoSize, {as: 'Thumb'});

var TelegramMessage = require('./models/telegram/message')(sequelize, Sequelize);
TelegramMessage.belongsTo(TelegramUser, {as: 'From'});
TelegramMessage.belongsTo(TelegramChat, {as: 'Chat'});
TelegramMessage.belongsTo(TelegramUser, {as: 'ForwardFrom'});
TelegramMessage.belongsTo(TelegramChat, {as: 'ForwardFromChat'});
TelegramMessage.belongsTo(TelegramMessage, {as: 'ReplyToMessage'});
TelegramMessage.belongsToMany(TelegramChat, {as: 'Entities', through: 'telegram_message_messageentity'});
TelegramMessage.belongsTo(TelegramAudio, {as: 'Audio'});
TelegramMessage.belongsTo(TelegramDocument, {as: 'Document'});
TelegramMessage.belongsToMany(TelegramPhotoSize, {as: 'Photo', through: 'telegram_message_photo'});
TelegramMessage.belongsTo(TelegramSticker, {as: 'Sticker'});
TelegramMessage.belongsTo(TelegramVideo, {as: 'Video'});
TelegramMessage.belongsTo(TelegramVoice, {as: 'Voice'});
TelegramMessage.belongsTo(TelegramContact, {as: 'Contact'});
TelegramMessage.belongsTo(TelegramLocation, {as: 'Location'});
TelegramMessage.belongsTo(TelegramVenue, {as: 'Venue'});
TelegramMessage.belongsTo(TelegramUser, {as: 'NewChatMember'});
TelegramMessage.belongsTo(TelegramUser, {as: 'LeftChatMember'});
TelegramMessage.belongsToMany(TelegramPhotoSize, {as: 'NewChatPhoto', through: 'telegram_message_newchatphoto'});
TelegramMessage.belongsTo(TelegramMessage, {as: 'PinnedMessage'});

var TelegramDB = {
  Audio        : TelegramAudio,
  Chat         : TelegramChat,
  Contact      : TelegramContact,
  Document     : TelegramDocument,
  Location     : TelegramLocation,
  Message      : TelegramMessage,
  MessageEntity: TelegramMessageEntity,
  PhotoSize    : TelegramPhotoSize,
  Sticker      : TelegramSticker,
  User         : TelegramUser,
  Venue        : TelegramVenue,
  Video        : TelegramVideo,
  Voice        : TelegramVoice
};

sequelize.sync({force: false}).done(function () {
  logger.info('db synced');

  return User.create({
    username: 'admin',
    password: 'admin',
    email   : 'asdf@asdf.com'
  });
});

// Load Libraries
var ks = require('./lib/ks')(redisCache, Keystore);

// Load Controllers
var ksController       = require('./controllers/ks')(ks);
var telegramController = require('./controllers/telegram')(logger, redisCache, ks, TelegramDB);
var userController     = require('./controllers/user')(logger, redisCache, User, OAuthClient, OAuthCode, OAuthToken);

// Load Routes
var routes = require('./routes/index'),
    users  = require('./routes/users');

// Start Application
var app = express();

app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('dev'));
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
