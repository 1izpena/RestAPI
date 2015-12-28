'use strict';

var Auth  = require('../helpers/authentication');
var Message  = require('../models/message');

exports.newmessage = function newmessage (request, response) {

    console.log ("New message to channel " + request.params.channelid);

    // Verificamos si el token es valido y corresponde a un usuario
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }

        var data = request.body;
        data.channelid = request.params.channelid;
        Message.newMessage(data).then(function newmessage (error, result) {
                if (error) {
                    response.status(error.code).json({message: error.message});
                }
                //

            }

        );
    });
};

