  'use strict';

var User  = require('../models/user');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});



exports.forumsearch = function forumsearch (request, response) {

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

    exports.chatsearch = function chatsearch (request, response) {

    client.search({
      index: 'messages',
      body: {
        query: {
                    query_string:{
                       "fields" : ["content.title", "content.text", "content.answers", "_user"],
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
