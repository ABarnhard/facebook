'use strict';

var Mongo = require('mongodb'),
    _     = require('lodash');

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
  Message.collection.find(filter).sort(sort).toArray(cb);
};

Message.findOne = function(messageId, userId, cb){
  var _id = Mongo.ObjectID(messageId);
  Message.collection.findOne({_id:_id, toId:userId}, function(err, obj){
    if(!obj){return cb();}

    cb(err, _.create(Message.prototype, obj));
  });
};

Message.read = function(messageId, userId, cb){
  Message.findOne(messageId, userId, function(err, m){
    if(!m){return cb();}

    m.isRead = true;
    m.save(function(){
      cb(null, m);
    });
  });
};

Message.prototype.save = function(cb){
  Message.collection.save(this, cb);
};

Message.countUnreadForUser = function(id, cb){
  Message.collection.count({toId:id, isRead:false}, cb);
};

module.exports = Message;

