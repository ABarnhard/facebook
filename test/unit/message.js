/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    Message   = require('../../app/models/message'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    Mongo     = require('mongodb'),
    db        = 'facebook-test';

describe('Message', function(){
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
    it('should create a new Message object', function(){
      var fromId = Mongo.ObjectID(),
          toId   = Mongo.ObjectID(),
          body   = 'This is the text of the message',
          m      = new Message(fromId, toId, body);
      expect(m).to.be.instanceof(Message);
      expect(m.sent).to.be.instanceof(Date);
      expect(m.toId).to.be.instanceof(Mongo.ObjectID);
      expect(m.fromId).to.be.instanceof(Mongo.ObjectID);
    });
  });

  describe('#save', function(){
    it('should save a message in the database', function(done){
      var from = Mongo.ObjectID(),
          toId = Mongo.ObjectID(),
          body = 'This is the text of the message',
          m    = new Message(from, toId, body);
      m.save(function(){
        expect(m._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });

});

