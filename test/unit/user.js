/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../app/models/user'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    Mongo     = require('mongodb'),
    db        = 'facebook-test';

describe('User', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      done();
    });
  });

  describe('constructor', function(){
    it('should create a new User object', function(){
      var u = new User();
      expect(u).to.be.instanceof(User);
    });
  });

  describe('.updateProfile', function(){
    it('should add profile properties to the user object', function(done){
      var u = new User(),
          data = {name:'test', visible:'private', empty:'  '};
      User.updateProfile(u, data, function(){
        expect(u.name).to.equal('test');
        expect(u.isPublic).to.equal(false);
        expect(u.empty).to.be.undefined;
        done();
      });
    });
  });

  describe('.findAllPublicUsers', function(){
    it('should return all users who\'s profile is set to public', function(done){
      User.findAllPublicUsers(function(err, users){
        expect(users).to.have.length(2);
        done();
      });
    });
  });

  describe('.find', function(){
    it('should return a user that matches passed in query', function(done){
      User.find({email:'nodeapptest+sue@gmail.com'}, function(err, user){
        expect(user).to.be.ok;
        expect(user.name).to.equal('Sue');
        done();
      });
    });
  });

  describe('.authenticate', function(){
    it('should return an authenticated user', function(done){
      var data = {email:'nodeapptest+bob@gmail.com', password:'1234'};
      User.authenticate(data, function(user){
        expect(user).to.be.ok;
        expect(user.unreadMessages).to.equal(1);
        done();
      });
    });
  });

  describe('.fetchMessages', function(){
    it('should return all messages for a user', function(done){
      var id = Mongo.ObjectID('000000000000000000000001');
      User.fetchMessages(id, {}, function(err, messages){
        expect(messages).to.have.length(2);
        expect(messages[0].fromName).to.equal('Sue');
        done();
      });
    });
  });

  describe('.readMessage', function(){
    it('should return a message and update it\'s isRead status', function(done){
      var userId    = Mongo.ObjectID('000000000000000000000001'),
          messageId = 'a00000000000000000000002';
      User.readMessage(messageId, userId, function(err, message){
        expect(message.isRead).to.equal(true);
        expect(message.fromName).to.equal('Sue');
        done();
      });
    });
  });

  describe('#send', function(){
    it('should send a text message to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){
        User.findById('000000000000000000000003', function(err, receiver){
          sender.send(receiver, {mtype:'text', message:'yo'}, function(err, response){
            expect(response.sid).to.be.ok;
            done();
          });
        });
      });
    });
    it('should send an email  message to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){
        User.findById('000000000000000000000003', function(err, receiver){
          sender.send(receiver, {mtype:'email', message:'yo'}, function(err, response){
            expect(response.id).to.be.ok;
            done();
          });
        });
      });
    });
    it('should send an internal  message to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){
        User.findById('000000000000000000000003', function(err, receiver){
          sender.send(receiver, {mtype:'internal', message:'yo'}, function(err, response){
            expect(response._id).to.be.instanceof(Mongo.ObjectID);
            done();
          });
        });
      });
    });
  });

});

