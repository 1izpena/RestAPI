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
                                        if (request.body.channelType == "PUBLIC"){
                                            socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('newPublicChannel', channel);
                                            var Group = mongoose.model('Group');
                                            Group.parsepopulated(request.params.userid,channel.group.groupId).then(function (error, group) {
                                                if (error){
                                                    response.status(error.code).json({message: error.message});
                                                }
                                                else {
                                                    for (var i=0;i<group.users.length;i++){
                                                        var roomName = 'US_'+ group.users[i].id;
                                                        for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                            if ( socketio.getIO().sockets.connected[socketid]) {
                                                                var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                if (connectedUser && connectedUser == group.users[i].id) {
                                                                    console.log("Emit newGroupEvent for new public channel");
                                                                    socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: group.id,  message: group.groupName + ' --> New Public channel ' + channel.channelName + ' in group'});
                                                                }

                                                            }
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                        if (request.body.channelType == "PRIVATE"){
                                            socketio.getIO().sockets.to('US_'+request.params.userid).emit('newPrivateChannel', channel);
                                        }
                                        console.log("channel successfully created... ");
                                        response.json(channel);
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
                                chatErrors.checkuserinchanneladd(request.params.channelid,request.params.userid1).then(function (error,result) {
                                    if (error){
                                        response.status(error.code).json({message: error.message});
                                    } else {
                                        var vuelta = {
                                            id: result._id,
                                            username: result.username,
                                            mail: result.mail
                                        };
                                        channelservice.adduser(request.params.groupid,request.params.userid1,request.params.channelid).then(function (error,result){
                                            if(error){
                                                response.status(error.code).json({message: error.message});
                                            }else{
                                                socketio.getIO().sockets.to('CH_'+request.params.channelid).emit('newMemberInChannel', {groupid: request.params.groupid, channelid: request.params.channelid, user: vuelta});
                                                if (result.channelType == "PRIVATE"){
                                                    socketio.getIO().sockets.to('US_'+request.params.userid1).emit('newPrivateChannel', result);
                                                }
                                                var Group = mongoose.model('Group');
                                                Group.parsepopulated(request.params.userid,result.group.groupId).then(function (error, group) {
                                                    if (error){
                                                        response.status(error.code).json({message: error.message});
                                                    }
                                                    else {
                                                        if (result.channelType == "PUBLIC"){
                                                            for (var i=0;i<group.users.length;i++){
                                                                var roomName = 'US_'+ group.users[i].id;
                                                                for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                                    if ( socketio.getIO().sockets.connected[socketid]) {
                                                                        var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                        if (connectedUser && connectedUser == group.users[i].id) {
                                                                            console.log("Emit newGroupEvent for new member in public channel");
                                                                            socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: group.groupName + ' --> New user ' + vuelta.username + ' added to public channel ' + result.channelName});
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }if (result.channelType == "PRIVATE"){
                                                            for (var j=0;j<result.users.length;j++){
                                                                var roomName = 'US_'+ result.users[j].id;
                                                                for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                                    if ( socketio.getIO().sockets.connected[socketid]) {
                                                                        var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                        if (connectedUser && connectedUser == result.users[j].id) {
                                                                            console.log("Emit newGroupEvent for new member in private channel");
                                                                            socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: group.groupName + ' --> New user ' + vuelta.username + ' added to private channel ' + result.channelName});
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }

                                                    }
                                                });
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
                                        var vuelta = {
                                            id: result._id,
                                            username: result.username,
                                            mail: result.mail
                                        };
                                        channelservice.deleteuser(request.params.groupid,request.params.userid1,request.params.channelid).then(function (error,result){
                                            if(error){
                                                response.status(error.code).json({message: error.message});
                                            }else{
                                                socketio.getIO().sockets.to('CH_'+request.params.channelid).emit('deletedUserFromChannel', {groupid: request.params.groupid, channelid: request.params.channelid, user: vuelta});
                                                socketio.getIO().sockets.to('US_'+request.params.userid1).emit('deletedPrivateChannel', result);
                                                for (var i=0;i<result.users.length;i++){
                                                    var roomName = 'US_'+ result.users[i].id;
                                                    for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                        if ( socketio.getIO().sockets.connected[socketid]) {
                                                            var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                            if (connectedUser && connectedUser == result.users[i].id) {
                                                                if (result.channelType == "PUBLIC"){
                                                                    console.log("Emit newGroupEvent for deleted member from public channel");
                                                                    socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: result.groupName + ' --> user ' + vuelta.username + ' deleted from public channel ' + result.channelName});
                                                                }
                                                                if (result.channelType == "PRIVATE"){
                                                                    console.log("Emit newGroupEvent for deleted member from private channel");
                                                                    socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: result.groupName + ' --> user ' + vuelta.username + ' deleted from private channel ' + result.channelName});
                                                                }
                                                            }
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
                                socketio.getIO().sockets.to('CH_'+request.params.channelid).emit('deletedUserFromChannel', {groupid: request.params.groupid, channelid: request.params.channelid, user: vuelta});
                                var Group = mongoose.model('Group');
                                Group.parsepopulated(request.params.userid,result.group.groupId).then(function (error, group) {
                                    if (error){
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {
                                        if (result.channelType == "PUBLIC"){
                                            for (var i=0;i<group.users.length;i++){
                                                var roomName = 'US_'+ group.users[i].id;
                                                for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                    if ( socketio.getIO().sockets.connected[socketid]) {
                                                        var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                        if (connectedUser && connectedUser == group.users[i].id) {
                                                            console.log("Emit newGroupEvent for unsuscribed member from public channel");
                                                            socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: group.groupName + ' --> user ' + vuelta.username + ' unsuscribed from public channel ' + result.channelName});
                                                        }
                                                    }
                                                }
                                            }
                                        }if (result.channelType == "PRIVATE"){
                                            for (var j=0;j<result.users.length;j++){
                                                roomName = 'US_'+ result.users[j].id;
                                                for (socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                    if ( socketio.getIO().sockets.connected[socketid]) {
                                                        connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                        if (connectedUser && connectedUser == result.users[j].id) {
                                                            console.log("Emit newGroupEvent for unsuscribed member from private channel");
                                                            socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: group.groupName + ' --> user ' + vuelta.username + ' unsuscribed from private channel ' + result.channelName});
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                    }
                                });
                                response.json(result);
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
                                            Group.parsepopulated(request.params.userid,result.group.groupId).then(function (error, group) {
                                                if (error){
                                                    response.status(error.code).json({message: error.message});
                                                }
                                                else {
                                                    if (result.channelType == "PUBLIC"){
                                                        for (var i=0;i<group.users.length;i++){
                                                            var roomName = 'US_'+ group.users[i].id;
                                                            for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                                if ( socketio.getIO().sockets.connected[socketid]) {
                                                                    var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                    if (connectedUser && connectedUser == group.users[i].id) {
                                                                        console.log("Emit newGroupEvent for edited public channel");
                                                                        socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: group.groupName + ' --> public channel ' + result.channelName + ' edited '});
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }if (result.channelType == "PRIVATE"){
                                                        for (var j=0;j<result.users.length;j++){
                                                            roomName = 'US_'+ result.users[j].id;
                                                            for (socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                                if ( socketio.getIO().sockets.connected[socketid]) {
                                                                    connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                    if (connectedUser && connectedUser == result.users[j].id) {
                                                                        console.log("Emit newGroupEvent for edited private channel");
                                                                        socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: group.groupName + ' --> private channel ' + result.channelName + ' edited '});
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }

                                                }
                                            });
                                            response.json(result);
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
                                        Group.parsepopulated(request.params.userid,result.group.groupId).then(function (error, group) {
                                            if (error){
                                                response.status(error.code).json({message: error.message});
                                            }
                                            else {
                                                if (result.channelType == "PUBLIC"){
                                                    for (var i=0;i<group.users.length;i++){
                                                        var roomName = 'US_'+ group.users[i].id;
                                                        for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                            if ( socketio.getIO().sockets.connected[socketid]) {
                                                                var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                if (connectedUser && connectedUser == group.users[i].id) {
                                                                    console.log("Emit newGroupEvent for deleted public channel");
                                                                    socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: group.groupName + ' --> public channel ' + result.channelName + ' deleted '});
                                                                }
                                                            }
                                                        }
                                                    }
                                                }if (result.channelType == "PRIVATE"){
                                                    for (var j=0;j<result.users.length;j++){
                                                        roomName = 'US_'+ result.users[j].id;
                                                        for (socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                            if ( socketio.getIO().sockets.connected[socketid]) {
                                                                connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                if (connectedUser && connectedUser == result.users[j].id) {
                                                                    console.log("Emit newGroupEvent for deleted private channel");
                                                                    socketio.getIO().sockets.to(roomName).emit('newGroupEvent', {groupid: request.params.groupid,  message: group.groupName + ' --> private channel ' + result.channelName + ' deleted '});
                                                                }
                                                            }
                                                        }
                                                    }
                                                }

                                            }
                                        });
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

