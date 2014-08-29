/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'facebook-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../app/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=nodeapptest%2Bbob%40gmail.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /profile/edit', function(){
    it('should show the edit profile page', function(done){
      request(app)
      .get('/profile/edit')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('nodeapptest+bob@gmail.com');
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        expect(res.text).to.include('Visible');
        done();
      });
    });
  });

  describe('put /profile', function(){
    it('should edit the profile in database', function(done){
      request(app)
      .post('/profile')
      .send('_method=put&visible=public&email=a%40b.com&phone=555-555-5555&photo=someUrl&tagline=some+tagline&facebook=facebookUrl&twitter=%40twitterhandle')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('get /profile', function(){
    it('should show the logged in users profile page', function(done){
      request(app)
      .post('/profile')
      .send('_method=put&visible=public&email=a%40b.com&phone=555-555-5555&photo=someUrl&tagline=some+tagline&facebook=facebookUrl&twitter=%40twitterhandle')
      .set('cookie', cookie)
      .end(function(err, res){
        request(app)
        .get('/profile')
        .set('cookie', cookie)
        .end(function(err, res){
          expect(res.status).to.equal(200);
          expect(res.text).to.include('Phone');
          expect(res.text).to.include('Twitter');
          expect(res.text).to.include('Facebook');
          done();
        });
      });
    });
  });

  describe('get /users', function(){
    it('should show links to public user profiles', function(done){
      request(app)
      .get('/users')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.not.include('Bob');
        expect(res.text).to.include('John');
        expect(res.text).to.not.include('Sue');
        done();
      });
    });
  });

  describe('get /users/email', function(){
    it('should return the profile page for a public profile', function(done){
      request(app)
      .get('/users/nodeapptest+john@gmail.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('John');
        done();
      });
    });
    it('should redirect away from private profile', function(done){
      request(app)
      .get('/users/nodeapptest+sue@gmail.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users');
        done();
      });
    });
  });

  describe('post /message/userId', function(){
    it('should send a text message to recipient', function(done){
      request(app)
      .post('/message/000000000000000000000003')
      .send('mtype=text&message=hey')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/nodeapptest+john@gmail.com');
        done();
      });
    });
    it('should send an email message to recipient', function(done){
      request(app)
      .post('/message/000000000000000000000003')
      .send('mtype=email&message=hey')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/nodeapptest+john@gmail.com');
        done();
      });
    });
    it('should send an inmail message to recipient', function(done){
      request(app)
      .post('/message/000000000000000000000003')
      .send('mtype=internal&message=hey')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/nodeapptest+john@gmail.com');
        done();
      });
    });
  });

});

