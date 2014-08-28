'use strict';

var bcrypt = require('bcrypt'),
    _      = require('lodash'),
    Mongo  = require('mongodb');

function User(){
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});

User.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, function(err, obj){
    cb(err, _.create(User.prototype, obj));
  });
};

User.register = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(user){return cb();}
    o.password = bcrypt.hashSync(o.password, 10);
    User.collection.save(o, cb);
  });
};

User.authenticate = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(!user){return cb();}
    var isOk = bcrypt.compareSync(o.password, user.password);
    if(!isOk){return cb();}
    cb(user);
  });
};

User.updateProfile = function(user, data, cb){
  // console.log('***Post Body:', data);
  Object.keys(data).forEach(function(key){
    data[key] = data[key].trim();
    if(data[key]){
      switch(key){
        case 'visible':
          user.isPublic = (data[key] === 'public');
          break;
        default:
          user[key] = data[key];
      }
    }
  });
  // console.log('*** Updated User:', user);
  User.collection.save(user, cb);
};

User.findAllPublicUsers = function(cb){
  User.collection.find({isPublic:true}).toArray(cb);
};

User.find = function(query, cb){
  User.collection.findOne(query, cb);
};

User.prototype.send = function(receiver, data, cb){
  switch(data.mtype){
    case 'text':
      sendText(receiver.phone, data.message, cb);
      break;
    case 'email':
      break;
    case 'internal':
  }
};

module.exports = User;

// Helper Functions
function sendText(to, body, cb){
  if(!to){return cb();}

  var accountSid = process.env.TWSID,
      authToken  = process.env.TWTOK,
      from       = process.env.FROM,
      client     = require('twilio')(accountSid, authToken);

  client.messages.create({to:to, from:from, body:body}, cb);
}

