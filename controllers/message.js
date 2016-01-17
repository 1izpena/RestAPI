'use strict';

var Auth  = require('../helpers/authentication');
var Message  = require('../models/message');
var socketio  = require('../helpers/sockets');
var chatErrors  = require('../helpers/chatErrorsHandler');


exports.newmessage = function newmessage (request, response) {

    // Verificamos si el token es valido y corresponde a un usuario
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }

        if (request.params.userid == result._id) {
            chatErrors.checkuserinchannel(request.params.channelid,request.params.userid)
                .then (function (error,result) {
                    if (error) {
                        response.status(401).json({message: 'User not included in requested channel'});
                    }
                    else {
                        var data = request.body;
                        var check = checkNewMessageInput(data);
                        if (!check.checked) {
                            response.status(check.errorcode).json({message: check.message});
                        }
                        else {
                            data.channelid = request.params.channelid;
                            data.userid = request.params.userid;
                            Message.newMessage(data).then(function newmessage(error, result) {
                                    if (error) {
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {
                                        // Notificamos al canal que hay nuevo mensaje
                                        socketio.getIO().sockets.to('CH_' + data.channelid).emit('newMessage', result);
                                        response.json(result);
                                    }
                                }
                            );
                        }
                    }
                });
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
            chatErrors.checkuserinchannel(request.params.channelid,request.params.userid)
                .then(function (error,result) {
                    if (error) {
                        response.status(401).json({message: 'User not included in requested channel'});
                    }
                    else {
                        var data = request.body;
                        data.channelid = request.params.channelid;
                        data.userid = request.params.userid;
                        data.limit = request.query.limit;
                        data.page = request.query.page;
                        Message.getMessages(data).then(function (error, result) {
                            if (error) {
                                response.status(error.code).json({message: error.message});
                            }
                            else {
                                response.json(result);
                            }
                        });
                    }

                });
        }
        else {
            response.status(401).json({message: 'Not authorized to get messages from another user'});
        }
    });
};


function checkNewMessageInput (data)
{
    var checked = true;
    var errorcode=400;
    var message="";
    var fieldsReq = [];

    if (!data.messageType) {
        fieldsReq.push('messageType');
    }
    else {
        if (data.messageType == 'TEXT') {
            if (!data.text) {
                fieldsReq.push('text');
            }
        }
        if (data.messageType == 'FILE') {
            if (!data.filename) {
                fieldsReq.push('filename');
            }
        }
    }

    if (fieldsReq.length > 0) {
        checked = false;
        errorcode=400;
        for(var i in fieldsReq) {
            if (message !== "" ) {
                message += ", ";
            }
            message += fieldsReq[i];
        }
        message += " required";
    }

    return {
        'checked': checked,
        'errorcode': errorcode,
        'message': message
    }

}

