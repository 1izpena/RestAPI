'use strict';

var Auth  = require('../helpers/authentication');
var channelservice  = require('../services/channel');
var mongoose = require('mongoose');
var chatErrors  = require('../helpers/chatErrorsHandler');
var User = require('../models/user');
var socketio  = require('../helpers/sockets');
var io = require('socket.io');


exports.newchannel = function newchannel (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                if (request.body.channelName == undefined || request.body.channelName == "" || request.body.channelName == null){
                    response.status(401).json({message: 'You must enter a valid channelName'});
                } else {
                    if (request.body.channelType == undefined || request.body.channelType == "" || request.body.channelType == null){
                        console.log("You must enter a valid channelType");
                        response.status(401).json({message: 'You must enter a value in channelType'});
                    } else {
                        if (request.body.channelType == "PUBLIC" || request.body.channelType == "PRIVATE" || request.body.channelType == "DIRECT"){
                            if (request.body.channelType == "DIRECT") {
                                var userid2 = request.body.secondUserid;
                                User.search({_id: userid2}, 1).then(function(error, user) {
                                    if (user === null) {
                                        response.status(401).json({message: 'SecondUserid not valid.'});

                                    } else {
                                        channelservice.createnewchannel(result._id, request.params.groupid, request.body.channelName, request.body.channelType, userid2).then(function (error, channel) {
                                            if (error) {
                                                response.status(error.code).json({message: error.message});
                                            } else {
                                                console.log("channel successfully created... ");
                                                response.json(channel);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                channelservice.createnewchannel(result._id,request.params.groupid,request.body.channelName,request.body.channelType).then(function (error,channel){
                                    if (error){
                                        response.status(error.code).json({message: error.message});
                                    }else {

                                        var Group = mongoose.model('Group');
                                        Group.parsepopulated(request.params.userid,request.params.groupid).then(function (error, group) {
                                            if (error){
                                                response.status(error.code).json({message: error.message});
                                            }
                                            else {
                                                if (request.body.channelType == "PUBLIC"){
                                                    var roomName = 'CH_'+result.id;
                                                    var conectedUsers = socketio.getUsersInSocket(roomName);
                                                    for (var i=0;i<channel.users.length;i++){
                                                        if(channel.users[i].id != request.params.userid){
                                                            if (conectedUsers.indexOf(channel.users[i]) == -1){
                                                                console.log("Emit newChannelEvent for new public channel");
                                                                socketio.getIO().sockets.to('US_'+channel.users[i].id).emit('newChannelEvent', {groupid: group.id, groupName: group.groupName, channelid: channel.id,channelName: channel.channelName, channelType:channel.channelType});

                                                            }
                                                        }
                                                    }
                                                    socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('newPublicChannel', channel);
                                                }
                                                if (request.body.channelType == "PRIVATE"){
                                                    socketio.getIO().sockets.to('US_'+request.params.userid).emit('newPrivateChannel', channel);
                                                }
                                                console.log("channel successfully created... ");
                                                response.json(channel);
                                            }
                                        });
                                    }
                                });
                            }
                        } else {
                            console.log("You must enter a valid channelType");
                            response.status(401).json({message: 'You must enter a valid channelType'});
                        }
                    }
                }

            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.getchanneluserlist = function getchanneluserlist (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                channelservice.getuserlist(request.params.channelid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.getgroupchannellist = function getgroupchannellist (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                channelservice.getchannellist(request.params.groupid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.addusertochannel = function addusertochannel (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){

                chatErrors.checkuserinchannel(request.params.channelid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        chatErrors.checkischanneladmin(request.params.channelid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                chatErrors.checkuserinchanneladd(request.params.channelid,request.params.userid1).then(function (error,res) {
                                    if (error){
                                        response.status(error.code).json({message: error.message});
                                    } else {
                                        channelservice.adduser(request.params.groupid,request.params.userid1,request.params.channelid).then(function (error,result){
                                            if(error){
                                                response.status(error.code).json({message: error.message});
                                            }else{
                                                var query = {_id: request.params.userid1};
                                                var limit = 1;
                                                var User = mongoose.model('User');
                                                User.search(query,limit).then(function (error, user) {
                                                    if (error){
                                                        response.status(error.code).json({message: error.message});
                                                    }
                                                    else {
                                                        if (user) {
                                                            var vuelta = {
                                                                id: user._id,
                                                                username: user.username,
                                                                mail: user.mail
                                                            };

                                                            var Group = mongoose.model('Group');
                                                            Group.parsepopulated(request.params.userid,request.params.groupid).then(function (error, grupo) {
                                                                if (error){
                                                                    response.status(error.code).json({message: error.message});
                                                                }
                                                                else {
                                                                    socketio.getIO().sockets.to('CH_'+request.params.channelid).emit('newMemberInChannel', {groupid: request.params.groupid, channelid: request.params.channelid, user: vuelta});
                                                                    if (result.channelType == "PRIVATE"){
                                                                        socketio.getIO().sockets.to('US_'+request.params.userid1).emit('newPrivateChannel', result);
                                                                    }
                                                                    var roomName = 'CH_'+result.id;
                                                                    var conectedUsers = socketio.getUsersInSocket(roomName);
                                                                    for (var i=0;i<result.users.length;i++){
                                                                        if(result.users[i].id != request.params.userid){
                                                                            if (conectedUsers.indexOf(result.users[i]) == -1){
                                                                                console.log("Emit newMemberInChannelEvent");
                                                                                socketio.getIO().sockets.to('US_'+ result.users[i].id).emit('newMemberInChannelEvent', {groupid: request.params.groupid,  groupName: grupo.groupName , userid: vuelta.id, username: vuelta.username, channelName: result.channelName, channelid: result.id, channelType: result.channelType});
                                                                            }
                                                                        }
                                                                    }

                                                                    response.json(result);
                                                                }
                                                            });


                                                        }else {
                                                            var err = {
                                                                code   : 404,
                                                                message: 'User not found'
                                                            };
                                                            response.status(error.code).json({message: error.message});
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.deleteuserfromchannel = function deleteuserfromchannel (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkuserinchannel(request.params.channelid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        chatErrors.checkischanneladmin(request.params.channelid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                chatErrors.checkuserinchannel(request.params.channelid,request.params.userid1).then(function (error,result){
                                    if(error){
                                        response.status(error.code).json({message: error.message});
                                    }else{

                                        channelservice.deleteuser(request.params.groupid,request.params.userid1,request.params.channelid).then(function (error,result){
                                            if(error){
                                                response.status(error.code).json({message: error.message});
                                            }else{
                                                var query = {_id: request.params.userid1};
                                                var limit = 1;
                                                var User = mongoose.model('User');
                                                User.search(query,limit).then(function (error, user) {
                                                    if (error){
                                                        response.status(error.code).json({message: error.message});
                                                    }
                                                    else {
                                                        if (user) {
                                                            var vuelta = {
                                                                id: user._id,
                                                                username: user.username,
                                                                mail: user.mail
                                                            };

                                                            var Group = mongoose.model('Group');
                                                            Group.parsepopulated(request.params.userid,request.params.groupid).then(function (error, grupo) {
                                                                if (error){
                                                                    response.status(error.code).json({message: error.message});
                                                                }
                                                                else {
                                                                    socketio.getIO().sockets.to('CH_'+request.params.channelid).emit('deletedUserFromChannel', {groupid: request.params.groupid, channelid: request.params.channelid, user: vuelta});
                                                                    socketio.getIO().sockets.to('US_'+request.params.userid1).emit('deletedPrivateChannel', result);
                                                                    var roomName = 'CH_'+request.params.channelid;
                                                                    var conectedUsers = socketio.getUsersInSocket(roomName);
                                                                    for (var i=0;i<result.users.length;i++){
                                                                        if(result.users[i].id != request.params.userid1){
                                                                            if (conectedUsers.indexOf(result.users[i]) == -1){
                                                                                console.log("Emit deletedMemberInChannelEvent");
                                                                                socketio.getIO().sockets.to('US_'+ result.users[i].id).emit('deletedMemberInChannelEvent', {groupid: request.params.groupid,  groupName: grupo.groupName , userid: vuelta.id, username: vuelta.username, channelName: result.channelName, channelid: result.id, channelType: result.channelType});
                                                                            }
                                                                        }
                                                                    }
                                                                    response.json(result);
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            var err = {
                                                                code   : 404,
                                                                message: 'User not found'
                                                            };
                                                            response.status(err.code).json({message: err.message});
                                                        }
                                                    }
                                                });

                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.unsuscribefromchannel = function unsuscribefromchannel (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            var vuelta = {
                id: result._id,
                username: result.username,
                mail: result.mail
            };
            if (request.params.userid == result._id){
                chatErrors.checkuserinchannel(request.params.channelid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        channelservice.deleteuser(request.params.groupid,request.params.userid,request.params.channelid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{

                                var Group = mongoose.model('Group');
                                Group.parsepopulated(request.params.userid,request.params.groupid).then(function (error, grupo) {
                                    if (error){
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {
                                        socketio.getIO().sockets.to('CH_'+request.params.channelid).emit('deletedUserFromChannel', {groupid: request.params.groupid, channelid: request.params.channelid, user: vuelta});
                                        socketio.getIO().sockets.to('US_'+request.params.userid).emit('deletedPrivateChannel', result);
                                        var roomName = 'CH_'+request.params.channelid;
                                        var conectedUsers = socketio.getUsersInSocket(roomName);
                                        for (var i=0;i<grupo.users.length;i++){
                                            if(grupo.users[i].id != request.params.userid){
                                                if (conectedUsers.indexOf(grupo.users[i]) == -1){
                                                    console.log("Emit deletedMemberInChannelEvent");
                                                    socketio.getIO().sockets.to('US_'+result.users[i].id).emit('deletedMemberInChannelEvent', {groupid: request.params.groupid,  groupName: grupo.groupName , userid: vuelta.id, username: vuelta.username, channelName: result.channelName, channelid: result.id, channelType: result.channelType});
                                                }
                                            }
                                        }
                                        response.json(result);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.updatechannelinfo = function updatechannelinfo (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkuserinchannel(request.params.channelid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        chatErrors.checkischanneladmin(request.params.channelid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                if (request.body.channelName == undefined || request.body.channelName == "" || request.body.channelName == null){
                                    console.log("You must enter a valid channelName");
                                    response.status(401).json({message: 'You must enter a valid channelName'});
                                } else {
                                    channelservice.updatechannelname(request.params.userid,request.params.groupid,request.params.channelid,request.body.channelName).then(function (error,result){
                                        if(error){
                                            response.status(error.code).json({message: error.message});
                                        }else{
                                            if (result.channelType == "PRIVATE"){
                                                socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('editedPrivateChannel', result);
                                            }
                                            if (result.channelType == "PUBLIC"){
                                                socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('editedPublicChannel', result);
                                            }
                                            var Group = mongoose.model('Group');
                                            Group.parsepopulated(request.params.userid,request.params.groupid).then(function (error, group) {
                                                if (error){
                                                    response.status(error.code).json({message: error.message});
                                                }
                                                else {
                                                    var roomName = 'CH_'+request.params.channelid;
                                                    var conectedUsers = socketio.getUsersInSocket(roomName);
                                                    for (var i=0;i<result.users.length;i++){
                                                        if(result.users[i].id != request.params.userid){
                                                            if (conectedUsers.indexOf(result.users[i]) == -1){
                                                                console.log("Emit editedChannelEvent");
                                                                socketio.getIO().sockets.to('US_'+result.users[i].id).emit('editedChannelEvent', {groupid: request.params.groupid,  groupName: group.groupName , channelName: result.channelName, channelid: result.id, channelType: result.channelType});
                                                            }
                                                        }
                                                    }
                                                    response.json(result);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.deletechannelfromgroup = function deletechannelfromgroup (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkuserinchannel(request.params.channelid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        chatErrors.checkischanneladmin(request.params.channelid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                channelservice.removechannel(request.params.userid,request.params.groupid,request.params.channelid).then(function (error,result){
                                    if(error){
                                        response.status(error.code).json({message: error.message});
                                    }else{
                                        if (result.channelType === "PRIVATE"){
                                            socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('deletedPrivateChannel', result);
                                        }
                                        if (result.channelType == "PUBLIC"){
                                            socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('deletedPublicChannel', result);
                                        }
                                        var Group = mongoose.model('Group');
                                        Group.parsepopulated(request.params.userid,request.params.groupid).then(function (error, group) {
                                            if (error){
                                                response.status(error.code).json({message: error.message});
                                            }
                                            else {
                                                var roomName = 'CH_'+result.id;
                                                var conectedUsers = socketio.getUsersInSocket(roomName);
                                                for (var i=0;i<result.users.length;i++){
                                                    if(result.users[i].id != request.params.userid){
                                                        if (conectedUsers.indexOf(result.users[i]) == -1){
                                                            console.log("Emit deletedChannelEvent");
                                                            socketio.getIO().sockets.to('US_'+result.users[i].id).emit('deletedChannelEvent', {groupid: request.params.groupid,  groupName: group.groupName , channelName: result.channelName, channelid: result.id, channelType: result.channelType});
                                                        }
                                                    }
                                                }
                                                response.json(result);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.getchannelinfo = function getchannelinfo (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                channelservice.getinfo(request.params.channelid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

