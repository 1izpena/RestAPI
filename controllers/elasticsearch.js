  'use strict';

var User  = require('../models/user');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});



exports.search = function search (request, response) {
    
client.search({
  index: 'questions',
  body: {
    query: {
                query_string:{
                   "fields" : ["title", "body"],
                   query:request.body.key
                }
            }

  }
}).then(function (resp) {
    response.json(resp);
}, function (err) {
    response.json(err.message);
});     
    };

