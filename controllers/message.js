'use strict';

var Auth  = require('../helpers/authentication');
var Message  = require('../models/message');
var User  = require('../models/user');
var socketio  = require('../helpers/sockets');
var chatErrors  = require('../helpers/chatErrorsHandler');
var groupservice  = require('../services/group');
var config  = require('../config');

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

exports.newanswer = function newmessage (request, response) {

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
                    if (!data.text) {
                        response.status(400).json({message: 'text required'});
                    }
                    else {
                        data.messageid = request.params.messageid;
                        data.channelid = request.params.channelid;
                        data.userid = request.params.userid;
                        Message.newAnswer(data).then(function newAnswer(error, messageAnswer) {
                                if (error) {
                                    response.status(error.code).json({message: error.message});
                                }
                                else {
                                    // Notificamos al canal que se ha modificado un mensaje
                                    socketio.getIO().sockets.to('CH_' + data.channelid).emit('newQuestionAnswer', messageAnswer);

                                    //Creamos un mensaje de texto avisando que se ha creado una respuesta:
                                    // Lo creamos con el usuario internalUser
                                    User.search({mail: config.internalUserMail}, 1).then(function(error, internalUser) {
                                        var messageData = {
                                            channelid: data.channelid,
                                            userid: internalUser.id ,
                                            messageType: 'TEXT',
                                            text: "internalMessage#NEW_ANSWER. QuestionId: '" + messageAnswer.id +
                                                                           "'. AnswerId: '" + messageAnswer.answer.id + "" +
                                                                           "'"
                                        };
                                        Message.newMessage(messageData).then(function newmessage(error, result) {
                                            if (!error) {
                                                // Notificamos al canal que hay nuevo mensaje
                                                socketio.getIO().sockets.to('CH_' + data.channelid).emit('newMessage', result);
                                            }
                                        });
                                    });


                                    response.json(result);
                                }
                            }
                        );
                    }
                }
            });
        }
        else {
            response.status(401).json({message: 'Not authorized to send answer from another user'});
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

exports.getfiles = function getfiles (request, response) {

    // Verificamos si el token es valido y corresponde a un usuario
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }

        if (request.params.userid == result._id) {
            chatErrors.checkuseringroup(request.params.groupid,request.params.userid)
                .then(function (error,result) {
                    if (error) {
                        response.status(401).json({message: 'Group not found for user'});
                    }
                    else {
                        // Buscamos los canales a los que tiene acceso dentro del grupo
                        groupservice.getinfo(request.params.groupid,request.params.userid)
                            .then(function (error,result) {
                                if (error) {

                                }
                                else {
                                    var data = request.body;
                                    data.userid = request.params.userid;
                                    data.channelsList = [];
                                    result.publicChannels.map (function(channel) {
                                        data.channelsList.push(channel.id);
                                    });
                                    result.privateChannels.map (function(channel) {
                                        data.channelsList.push(channel.id);
                                    });
                                    result.directMessageChannels.map (function(channel) {
                                        data.channelsList.push(channel.id);
                                    });
                                    data.limit = request.query.limit;
                                    data.page = request.query.page;
                                    Message.getFiles(data).then(function (error, result) {
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

                });


        }
        else {
            response.status(401).json({message: 'Not authorized to get files from another user'});
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
        else if (data.messageType == 'FILE') {
            if (!data.filename) {
                fieldsReq.push('filename');
            }
        }
        else if (data.messageType == 'QUESTION') {
            if (!data.title) {
                fieldsReq.push('title');
            }
            if (!data.text) {
                fieldsReq.push('text');
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

exports.deletechannelmessagges = function deletechannelmessagges (request, response) {

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
                        var query3 = {_channel:request.params.channelid};
                        Message.deletemessages(query3).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }
                            else {
                                // Notificamos al canal se ha eliminado mensaje
                                //socketio.getIO().sockets.to('CH_' + data.channelid).emit('messageDeleted', result);
                                console.log("Message deleted successfully");
                                response.json(result);
                            }
                        });
                    }
                });
        }
        else {
            response.status(401).json({message: 'Not authorized to post messages from another user'});
        }
    });
};

exports.deletechannelmessagge = function deletechannelmessagge (request, response) {

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
                        //var query3 = {_id:{$in:groupchannels}};
                        Message.deletemessage(request.params.messageid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }
                            else {
                                // Notificamos al canal se ha eliminado mensaje
                                //socketio.getIO().sockets.to('CH_' + data.channelid).emit('messageDeleted', result);
                                console.log("Message deleted successfully: " + request.params.messageid);
                                response.json(result);
                            }
                        });
                    }
                });
        }
        else {
            response.status(401).json({message: 'Not authorized to post messages from another user'});
        }
    });
};

