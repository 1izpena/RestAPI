'use strict';



var Auth  = require('../helpers/authentication');
var fileservice = require('../services/file');


exports.getSignedUrl = function getSignedUrl (request, response) {

    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }
        else {
            var data = request.body;
            if (!data.filename) {
                response.status(400).json({message: "filename required"});
            }
            else if (!data.groupid) {
                response.status(400).json({message: "groupid required"});
            }
            else if (!data.channelid) {
                response.status(400).json({message: "channelid required"});
            }
            else if (!data.userid) {
                response.status(400).json({message: "userid required"});
            }
            else if (!data.operation) {
                response.status(400).json({message: "operation required"});
            }
            else {
                var url=fileservice.getSignedUrl(data);

                response.json({url: url});
            }
        }
    });
};


