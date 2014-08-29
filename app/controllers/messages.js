'use strict';

var User   = require('../models/user'),
    moment = require('moment');

exports.index = function(req, res){
  User.fetchMessages(res.locals.user._id, req.query, function(err, messages){
    res.render('messages/index', {messages:messages, query:req.query, moment:moment});
  });
};

exports.show = function(req, res){
  User.readMessage(req.params.messageId, res.locals.user._id, function(err, message){
    if(message){
      res.render('messages/show', {message:message, moment:moment});
    }else{
      res.redirect('/messages');
    }
  });
};

