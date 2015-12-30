'use strict';

var Auth  = require('../helpers/authentication');
var Message  = require('../models/message');
var socketio  = require('../helpers/sockets');


exports.newmessage = function newmessage (request, response) {

    // Verificamos si el token es valido y corresponde a un usuario
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }

        var data = request.body;
        data.userid=result._id;
        data.channelid = request.params.channelid;
        Message.newMessage(data).then(function newmessage (error, result) {
                if (error) {
                    response.status(error.code).json({message: error.message});
                }
                else {
                    // Notificamos al canal que hay nuevo mensaje
                    socketio.getIO().sockets.to(data.channelid).emit('newMessage', result);
                    response.json(result);
                }
            }
        );
    });
};

