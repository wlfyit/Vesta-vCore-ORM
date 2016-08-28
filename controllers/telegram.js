'use strict';

var async       = require('async'),
    TelegramBot = require('node-telegram-bot-api');

module.exports = function (logger, redisCache, ks, TgDB) {
  var bot;
  var telegramController = {};

  // Logging Operations
  telegramController._logAudio         = function (seenAudio, done) {
    TgDB.Audio.findOne({
      where: {
        file_id: seenAudio.file_id
      }
    }).then(function (audio) {
      if (audio == null) {
        TgDB.Audio.create(seenAudio).then(function (newAudio) {
          done(null, newAudio);
        });
      }
      else {
        done(null, audio);
      }
    });
  };
  telegramController._logChat          = function (seenChat, done) {
    TgDB.Chat.findOne({
      where: {
        id: seenChat.id
      }
    }).then(function (chat) {
      if (chat == null) {
        TgDB.Chat.create(seenChat).then(function (newChat) {
          done(null, newChat);
        });
      }
      else {
        done(null, chat);
      }
    });
  };
  telegramController._logContact       = function (seenContact, done) {
    TgDB.Contact.findOne({
      where: {
        phone_number: seenContact.phone_number,
        first_name  : seenContact.first_name,
        last_name   : seenContact.last_name || null,
        user_id     : seenContact.user_id || null
      }
    }).then(function (contact) {
      if (contact == null) {
        TgDB.Contact.create(seenContact).then(function (newContact) {
          done(null, newContact);
        });
      }
      else {
        done(null, contact);
      }
    });
  };
  telegramController._logDocument      = function (seenDocument, done) {
    TgDB.Document.findOne({
      where: {
        file_id: seenDocument.file_id
      }
    }).then(function (document) {
      if (document == null) {
        TgDB.Document.create(seenDocument).then(function (newDocument) {
          if (seenDocument.thumb != null) {
            telegramController._logPhotoSize(seenDocument.thumb, function (err, thumb) {
              newDocument.setThumb(thumb);
              done(null, newDocument);
            });
          }
          else {
            done(null, newDocument);
          }
        });
      }
      else {
        done(null, document);
      }
    });
  };
  telegramController._logLocation      = function (seenLocation, done) {
    TgDB.Location.findOne({
      where: {
        longitude: seenLocation.longitude,
        latitude : seenLocation.latitude
      }
    }).then(function (location) {
      if (location == null) {
        TgDB.Location.create(seenLocation).then(function (newLocation) {
          done(null, newLocation);
        });
      }
      else {
        done(null, location);
      }
    });
  };
  telegramController._logMessage       = function (seenMessage, allDone) {
    logger.debug('message received:', seenMessage);
    TgDB.Message.findOne({
      where: {
        message_id: seenMessage.message_id
      }
    }).then(function (message) {

      if (message == null) {
        async.parallel({
          from             : function (done) {
            telegramController._logUser(seenMessage.from, done);
          },
          chat             : function (done) {
            telegramController._logChat(seenMessage.chat, done);
          },
          forwardedFrom    : function (done) {
            if (seenMessage.forward_from == null) {
              done(null, null);
            }
            else {
              telegramController._logUser(seenMessage.forward_from, done);
            }
          },
          forwardedFromChat: function (done) {
            if (seenMessage.forward_from_chat == null) {
              done(null, null);
            }
            else {
              telegramController._logChat(seenMessage.forward_from_chat, done);
            }
          },
          replyToMessage   : function (done) {
            if (seenMessage.reply_to_message == null) {
              done(null, null);
            }
            else {
              telegramController._logMessage(seenMessage.reply_to_message, done);
            }
          },
          entities         : function (done) {
            if (seenMessage.entities == null) {
              done(null, null);
            }
            else {
              async.map(seenMessage.entities, telegramController._logMessageEntity, function (err, results) {
                done(null, results);
              });
            }
          },
          audio            : function (done) {
            if (seenMessage.audio == null) {
              done(null, null);
            }
            else {
              telegramController._logChat(seenMessage.audio, done);
            }
          },
          document         : function (done) {
            if (seenMessage.document == null) {
              done(null, null);
            }
            else {
              telegramController._logDocument(seenMessage.document, done);
            }
          },
          photo            : function (done) {
            if (seenMessage.photo == null) {
              done(null, null);
            }
            else {
              async.map(seenMessage.photo, telegramController._logPhotoSize, function (err, results) {
                done(null, results);
              });
            }
          },
          sticker          : function (done) {
            if (seenMessage.sticker == null) {
              done(null, null);
            }
            else {
              telegramController._logSticker(seenMessage.sticker, done);
            }
          },
          video            : function (done) {
            if (seenMessage.video == null) {
              done(null, null);
            }
            else {
              telegramController._logVideo(seenMessage.video, done);
            }
          },
          voice            : function (done) {
            if (seenMessage.voice == null) {
              done(null, null);
            }
            else {
              telegramController._logVoice(seenMessage.voice, done);
            }
          },
          contact          : function (done) {
            if (seenMessage.contact == null) {
              done(null, null);
            }
            else {
              telegramController._logContact(seenMessage.contact, done);
            }
          },
          location         : function (done) {
            if (seenMessage.location == null) {
              done(null, null);
            }
            else {
              telegramController._logLocation(seenMessage.location, done);
            }
          },
          venue            : function (done) {
            if (seenMessage.venue == null) {
              done(null, null);
            }
            else {
              telegramController._logVenue(seenMessage.venue, done);
            }
          },
          newChatMember    : function (done) {
            if (seenMessage.new_chat_member == null) {
              done(null, null);
            }
            else {
              telegramController._logUser(seenMessage.new_chat_member, done);
            }
          },
          leftChatMember   : function (done) {
            if (seenMessage.left_chat_member == null) {
              done(null, null);
            }
            else {
              telegramController._logUser(seenMessage.left_chat_member, done);
            }
          },
          newChatPhoto     : function (done) {
            if (seenMessage.new_chat_photo == null) {
              done(null, null);
            }
            else {
              async.map(seenMessage.new_chat_photo, telegramController._logPhotoSize, function (err, results) {
                done(null, results);
              });
            }
          },
          pinnedMessage    : function (done) {
            if (seenMessage.pinned_message == null) {
              done(null, null);
            }
            else {
              telegramController._logMessage(seenMessage.pinned_message, done);
            }
          }
        }, function (err, results) {
          TgDB.Message.create(seenMessage).then(function (newMessage) {
            newMessage.setFrom(results.from);
            newMessage.setChat(results.chat);
            newMessage.setForwardFrom(results.forwardedFrom);
            newMessage.setForwardFromChat(results.forwardedFromChat);
            newMessage.setReplyToMessage(results.replyToMessage);
            newMessage.setEntities(results.entities);
            newMessage.setAudio(results.audio);
            newMessage.setDocument(results.document);
            newMessage.setPhoto(results.photo);
            newMessage.setSticker(results.sticker);
            newMessage.setVideo(results.video);
            newMessage.setVoice(results.voice);
            newMessage.setContact(results.contact);
            newMessage.setLocation(results.location);
            newMessage.setVenue(results.venue);
            newMessage.setNewChatMember(results.newChatMember);
            newMessage.setLeftChatMember(results.leftChatMember);
            newMessage.setNewChatPhoto(results.newChatPhoto);
            newMessage.setPinnedMessage(results.pinnedMessage);

            allDone(null, newMessage);
          });

        });
      }
      else {
        done(null, message);
      }
    });


  };
  telegramController._logMessageEntity = function (seenEntity, done) {
    TgDB.MessageEntity.findOne({
      where: {
        type  : seenEntity.type,
        offset: seenEntity.offset,
        length: seenEntity.length,
        url   : seenEntity.url || null
      }
    }).then(function (entity) {
      if (entity == null) {
        TgDB.MessageEntity.create(seenEntity).then(function (newEntity) {
          if (seenEntity.user != null) {
            telegramController._logUser(seenEntity.user, function (err, user) {
              newEntity.setUser(user);
              done(null, newEntity);
            });
          }
          else {
            done(null, newSticker);
          }
          done(null, newSticker);
        });
      }
      else {
        done(null, entity);
      }
    });
  };
  telegramController._logPhotoSize     = function (seenPhotoSize, done) {
    TgDB.PhotoSize.findOne({
      where: {
        file_id: seenPhotoSize.file_id
      }
    }).then(function (photoSize) {
      if (photoSize == null) {
        TgDB.PhotoSize.create(seenPhotoSize).then(function (newPhotoSize) {
          done(null, newPhotoSize);
        });
      }
      else {
        done(null, photoSize);
      }
    });
  };
  telegramController._logSticker       = function (seenSticker, done) {
    TgDB.Sticker.findOne({
      where: {
        file_id: seenSticker.file_id
      }
    }).then(function (sticker) {
      if (sticker == null) {
        TgDB.Sticker.create(seenSticker).then(function (newSticker) {
          if (seenSticker.thumb != null) {
            telegramController._logPhotoSize(seenSticker.thumb, function (err, thumb) {
              newSticker.setThumb(thumb);
              done(null, newSticker);
            });
          }
          else {
            done(null, newSticker);
          }
        });
      }
      else {
        done(null, sticker);
      }
    });
  };
  telegramController._logUser          = function (seenUser, done) {
    TgDB.User.findOne({
      where: {
        id: seenUser.id
      }
    }).then(function (user) {
      if (user == null) {
        TgDB.User.create(seenUser).then(function (newUser) {
          done(null, newUser);
        });
      }
      else {
        done(null, user);
      }
    });
  };
  telegramController._logVenue         = function (seenVenue, done) {
    TgDB.Venue.findOne({
      where: {
        title        : seenVenue.title,
        address      : seenVenue.address,
        foursquare_id: seenVenue.foursquare_id
      }
    }).then(function (venue) {
      if (venue == null) {
        TgDB.Venue.create(seenVenue).then(function (newVenue) {
          if (seenVenue.location != null) {
            telegramController._logLocation(seenVenue.location, function (err, location) {
              newVenue.setLocation(location);
              done(null, newVenue);
            });
          }
          else {
            done(null, newVenue);
          }
        });
      }
      else {
        done(null, venue);
      }
    });
  };
  telegramController._logVideo         = function (seenVideo, done) {
    TgDB.Video.findOne({
      where: {
        file_id: seenVideo.file_id
      }
    }).then(function (video) {
      if (video == null) {
        TgDB.Video.create(seenVideo).then(function (newVideo) {
          if (seenVideo.thumb != null) {
            telegramController._logPhotoSize(seenVideo.thumb, function (err, thumb) {
              newVideo.setThumb(thumb);
              done(null, newVideo);
            });
          }
          else {
            done(null, newVideo);
          }
        });
      }
      else {
        done(null, video);
      }
    });
  };
  telegramController._logVoice         = function (seenVoice, done) {
    TgDB.Voice.findOne({
      where: {
        file_id: seenVoice.file_id
      }
    }).then(function (voice) {
      if (voice == null) {
        TgDB.Voice.create(seenVoice).then(function (newVoice) {
          done(null, newVoice);
        });
      }
      else {
        done(null, voice);
      }
    });
  };

  // Receive Messages
  telegramController._receiveMessage = function (message) {
    telegramController._logMessage(message, function(msgObj){});
    logger.debug('message received:', message);
  };

  ks.get('config:telegram:token', function (err, result) {
    if (result != false) {
      bot = new TelegramBot(result.value, {polling: true});
      bot.on('message', telegramController._receiveMessage);
    }
  });

  return telegramController;
};
