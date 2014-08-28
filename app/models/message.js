'use strict';

var User  = require('./user'),
    async = require('async');

function Message(fromId, toId, body){
  this.fromId = fromId;
  this.toId = toId;
  this.body = body;
  this.sent = new Date();
  this.isRead = false;
}

Object.defineProperty(Message, 'collection', {
  get: function(){return global.mongodb.collection('messages');}
});

Message.find = function(toId, query, cb){
  var filter = {toId:toId},
      sort   = {};
  sort.sent = (query.sort) ? query.sort * 1 : 1;
  Message.collection.find(filter).sort(sort).toArray(function(err, objs){
    // console.log('***objs', objs);
    async.map(objs, getSenderInfo, function(err2, fullMessages){
      // console.log(fullMessages);
      cb(null, fullMessages);
    });
  });
};

Message.findOne = function(query, cb){
  Message.collection.findOne(query, cb);
};

Message.prototype.save = function(cb){
  Message.collection.save(this, cb);
};

Message.countUnreadForUser = function(id, cb){
  Message.collection.count({toId:id, isRead:false}, cb);
};

module.exports = Message;

// helper functions
function getSenderInfo(message, done){
  User.findById(message.fromId, function(err, user){
    console.log(user);
    message.fromName = user.name;
    message.fromEmail = user.email;
    // console.log(message);
    done(null, message);
  });
}

