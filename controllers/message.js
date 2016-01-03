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

        if (request.params.userid == result._id) {
            var data = request.body;
            data.channelid = request.params.channelid;
            data.userid = request.params.userid;
            Message.newMessage(data).then(function newmessage(error, result) {
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
        }
        else {
            response.status(401).json({message: 'Not authorized to post messages from another user'});
        }
    });
};

exports.getmessages = function getmessages (request, response) {

    // Verificamos si el token es valido y corresponde a un usuario
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }

        if (request.params.userid == result._id) {
            var data = request.body;
            data.channelid = request.params.channelid;
            data.userid = request.params.userid;
            Message.getMessages(data).then(function(error, result) {
                    if (error) {
                        response.status(error.code).json({message: error.message});
                    }
                    else {
                        response.json(result);
                    }
                }
            );
        }
        else {
            response.status(401).json({message: 'Not authorized to get messages from another user'});
        }
    });
};

