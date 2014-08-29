'use strict';

exports.sort = function(query, display){
  var sort = query.sort ? query.sort * -1 : 1,
      link = '<a href="/messages?sort=' + sort + '">'+display+'</a>';
  return link;
};

