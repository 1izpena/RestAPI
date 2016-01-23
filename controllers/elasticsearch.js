  'use strict';

var User  = require('../models/user');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});


exports.search = function search (request, response) {
    
client.search({
  index: 'users',
  body: {
    query: {
                query_string:{
                   query:request.body.username
                }
            }

  }
}).then(function (resp) {
    var hits = resp.hits.hits;
    console.log(resp);
}, function (err) {
    console.trace(err.message);
});
     
    };

