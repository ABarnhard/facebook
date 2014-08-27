'use strict';

var bcrypt = require('bcrypt'),
    Mongo  = require('mongodb');

function User(){
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});

User.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, cb);
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

module.exports = User;

