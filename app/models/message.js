'use strict';

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

