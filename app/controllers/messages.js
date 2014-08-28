'use strict';

var Message = require('../models/message');

exports.index = function(req, res){
  Message.find(res.locals.user._id, req.query, function(err, messages){
    res.render('messages/index', {messages:messages, query:req.query});
  });
};

