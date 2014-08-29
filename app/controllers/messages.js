'use strict';

var User   = require('../models/user'),
    moment = require('moment');

exports.index = function(req, res){
  User.fetchMessages(res.locals.user._id, req.query, function(err, messages){
    res.render('messages/index', {messages:messages, query:req.query, moment:moment});
  });
};

