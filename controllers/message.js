'use strict';

var Auth  = require('../helpers/authentication');
var Message  = require('../models/message');
var User  = require('../models/user');
var QuestionService  = require('../services/question');
var socketio  = require('../helpers/sockets');
var chatErrors  = require('../helpers/chatErrorsHandler');
var groupservice  = require('../services/group');
var config  = require('../config');
var mongoose = require('mongoose');

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
                                        //socketio.getIO().sockets.to('MSGCH_' + data.channelid).emit('newMessage', {groupid: request.params.groupid, message: result});
                                        socketio.getIO().sockets.to('CH_' + data.channelid).emit('newMessage', {groupid: request.params.groupid, message: result});
                                        var Channel = mongoose.model('Channel');
                                        Channel.parsepopulated(data.channelid).then(function (error, channel) {
                                            if (error){
                                                response.status(error.code).json({message: error.message});
                                            }
                                            else {
                                                var Group = mongoose.model('Group');
                                                Group.parsepopulated(request.params.userid,request.params.groupid).then(function (error, group) {
                                                    if (error){
                                                        response.status(error.code).json({message: error.message});
                                                    }
                                                    else {
                                                        console.log("channelType: " + channel.channelType);
                                                        if (channel.channelType == "PUBLIC"){
                                                            for (var i=0;i<group.users.length;i++){
                                                                var roomName = 'US_'+ group.users[i].id;
                                                                for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                                    if ( socketio.getIO().sockets.connected[socketid]) {
                                                                        var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                        if (connectedUser && connectedUser == group.users[i].id && connectedUser!= request.params.userid) {
                                                                            console.log("Emit newMessageEvent in public channel");
                                                                            socketio.getIO().sockets.to(roomName).emit('newMessageEvent', {groupid: request.params.groupid,  groupName: group.groupName , channelName: channel.channelName, channelid: channel.id, channelType: channel.channelType, message: result});
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }if (channel.channelType == "PRIVATE"){
                                                            for (var j=0;j<channel.users.length;j++){
                                                                roomName = 'US_'+ channel.users[j].id;
                                                                for (socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                                    if ( socketio.getIO().sockets.connected[socketid]) {
                                                                        connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                        if (connectedUser && connectedUser == channel.users[j].id && connectedUser!= request.params.userid) {
                                                                            console.log("Emit newMessageEvent in private channel");
                                                                            socketio.getIO().sockets.to(roomName).emit('newMessageEvent', {groupid: request.params.groupid,  groupName: group.groupName , channelName: channel.channelName, channelid: channel.id, channelType: channel.channelType, message: result});
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }

                                                    }
                                                });
                                            }
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
                                                    //socketio.getIO().sockets.to('MSGCH_' + data.channelid).emit('newMessage', {groupid: request.params.groupid,message: result});
                                                    socketio.getIO().sockets.to('CH_' + data.channelid).emit('newMessage', {groupid: request.params.groupid,message: result});
                                                    var Channel = mongoose.model('Channel');
                                                    Channel.parsepopulated(data.channelid).then(function (error, channel) {
                                                        if (error){
                                                            response.status(error.code).json({message: error.message});
                                                        }
                                                        else {
                                                            var Group = mongoose.model('Group');
                                                            Group.parsepopulated(request.params.userid,request.params.groupid).then(function (error, group) {
                                                                if (error){
                                                                    response.status(error.code).json({message: error.message});
                                                                }
                                                                else {
                                                                    console.log("channelType: " + channel.channelType);
                                                                    if (channel.channelType == "PUBLIC"){
                                                                        for (var i=0;i<group.users.length;i++){
                                                                            var roomName = 'US_'+ group.users[i].id;
                                                                            for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                                                if ( socketio.getIO().sockets.connected[socketid]) {
                                                                                    var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                                    if (connectedUser && connectedUser == group.users[i].id && connectedUser!= request.params.userid) {
                                                                                        console.log("Emit newMessageEvent in public channel");
                                                                                        socketio.getIO().sockets.to(roomName).emit('newMessageEvent', {groupid: request.params.groupid,  groupName: group.groupName , channelName: channel.channelName, channelid: channel.id, channelType: channel.channelType, message:result});
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }if (channel.channelType == "PRIVATE"){
                                                                        for (var j=0;j<channel.users.length;j++){
                                                                            roomName = 'US_'+ channel.users[j].id;
                                                                            for (socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                                                if ( socketio.getIO().sockets.connected[socketid]) {
                                                                                    connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                                    if (connectedUser && connectedUser == channel.users[j].id && connectedUser!= request.params.userid) {
                                                                                        console.log("Emit newMessageEvent in private channel");
                                                                                        socketio.getIO().sockets.to(roomName).emit('newMessageEvent', {groupid: request.params.groupid,  groupName: group.groupName , channelName: channel.channelName, channelid: channel.id, channelType: channel.channelType, message:result});
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }

                                                                }
                                                            });
                                                        }
                                                    });
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

exports.publishQuestion = function publishQuestion (request, response) {

    // Verificamos si el token es valido y corresponde a un usuario
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }

        if (request.params.userid == result._id) {
            chatErrors.checkismessageadmin(request.params.messageid,request.params.userid)
                .then (function (error, message) {
                    if (error) {
                        response.status(401).json({message: 'Unauthorized to publish another user message'});
                    }
                    else {
                        if (message.messageType != 'QUESTION') {
                            response.status(400).json({message: 'Message not QUESTION type'});
                        }
                        else if (message.publish) {
                            response.status(401).json({message: 'Message already publish'});
                        }
                        else {
                            var answersData = [];
                            var answer;
                            for (var i=0; i < message.content.answers.length; i++) {
                                answer = {
                                    _user: message.content.answers[i]._user,
                                    body: message.content.answers[i].text,
                                    created: message.content.answers[i].datetime
                                };
                                answersData.push(answer);
                            }

                            QuestionService.createanswers(answersData).then(function createAnswers(error, insertAnswers) {
                                if (error) {
                                    if (error.code)
                                        response.status(error.code).json({message: error.message});
                                    else
                                        response.status(500).json(error)
                                }
                                else {
                                    var questionData = {
                                        _user:  message._user,
                                        created: message.datetime,
                                        title:  message.content.title,
                                        body:  message.content.text,
                                        answers: insertAnswers.answersCreated,
                                        answercount: insertAnswers.answersCreated.length,
                                        tags: request.body.tags
                                    };
                                    QuestionService.createquestion(questionData).then(function createanswers (error, question) {
                                        if (error){
                                            if (error.code)
                                                response.status(error.code).json({message: error.message});
                                            else
                                                response.status(500).json(error)
                                        }
                                        else {
                                            // Modificamos mensaje
                                            message.publish = true;
                                            message.save(function(error,message){
                                                if(error) {
                                                    if (error.code)
                                                        response.status(error.code).json({message: error.message});
                                                    else
                                                        response.status(500).json(error)
                                                }
                                                else {
                                                    response.json(message)
                                                }
                                            });

                                        }
                                    });
                                }
                            });
                        }



                    }
                });
        }
        else {
            response.status(401).json({message: 'Not authorized to send answer from another user'});
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

