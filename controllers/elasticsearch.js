  'use strict';

var User  = require('../models/user');
var Auth  = require('../helpers/authentication');
var chatErrors  = require('../helpers/chatErrorsHandler');

var elasticsearch = require('elasticsearch');
var searchChat = require('../helpers/searchChat');
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
  console.log("esto vale la request");
  console.log(request.body.key);

  if(request.body.key !== 'undefined') {



  Auth(request, response).then(function(error, result) {
    if (error) {  
      response.status(error.code).json({message: error.message});

    } else {

        /* miramos si el usuario es quien dice ser */
        if (request.params.userid == result._id){

            /* miramos si el usuario tiene el canal */
            chatErrors.checkuserinchannel(request.params.channelid, request.params.userid).then(function (error,result){
                  if(error){
                      response.status(error.code).json({message: error.message});

                  } else {

                      searchChat(request, response, client)
                        .then(function (resp) {
                            response.json(resp);
                        }, function (err) {
                            response.json(err.message);
                      });


                  }
            });
                 

        } else {
            response.status(401).json({message: 'Unauthorized. The content that you are trying access is private'});

        } /* else ::permision denied */

     
    }
  });

} else {
   response.status(204).json({message: 'No content in searched text.'});

}


};
