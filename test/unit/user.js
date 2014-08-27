/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../app/models/user'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'template-test';

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
          data = {name:'test'};
      User.updateProfile(u, data, function(){
        expect(u.name).to.equal('test');
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

});

