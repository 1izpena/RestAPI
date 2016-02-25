'use strict';

var channelservice  = require('../services/channel');
var groupservice  = require('../services/group');

var io;

function getUserSocket (userid) {

    var roomName = 'US_'+ userid;
    var socketid;
    for (socketid in io.sockets.adapter.rooms[roomName]) {
        console.log ("socket "+socketid+" in room "+roomName);

        if ( io.sockets.connected[socketid]) {
            return  io.sockets.connected[socketid];
        }



    }
}

function getUsersInSocket (roomName) {
    var socketid;
    var connectedUsers = [];
    for (socketid in io.sockets.adapter.rooms[roomName]) {
        console.log ("USERS IN SOCKET socketid: " + socketid + "roomName: " + roomName);
        if ( io.sockets.connected[socketid]) {
            if (io.sockets.connected[socketid].userid) {
                console.log ("User: " + io.sockets.connected[socketid].userid);
                connectedUsers.push(io.sockets.connected[socketid].userid);
            }
        }
    }
    return (connectedUsers);
}

function manageGroupChannelRooms (op, userid, groupid) {

    // Suscribimos o cancelamos la suscripcion al usuario a todos los canales del grupo a los que tiene acceso
    var channels=[];
    var roomName;
    var userSocket;
    console.log("manageGroupChannelRooms. op = "+op+" userid = "+userid+" groupid = "+groupid);
    groupservice.getinfo(groupid,userid)
        .then(function (error, result){
            if(!error){
                channels = channels
                    .concat(result.publicChannels)
                    .concat(result.privateChannels)
                    .concat(result.directMessageChannels);

                userSocket=getUserSocket(userid);

                for (var i=0; i < channels.length; i++) {
                    roomName = 'MSGCH_'+channels[i].id;
                    if (op == 'JOIN') {
                        userSocket.join(roomName);
                        console.log ("SOCKET(manageGroupChannelRooms) "+userSocket.id+"(userid="+userSocket.userid+") join to room "+roomName);
                    }
                    else {
                        userSocket.leave(roomName);
                        console.log ("SOCKET(manageGroupChannelRooms) "+userSocket.id+"(userid="+userSocket.userid+") leave room "+roomName);
                    }
                }
            }
            else {
                console.log(error)
            }
        });
}

module.exports = {
    init: function (server) {
        io = require('socket.io').listen(server);
        io.on('connection', function (socket) {
                // Hacemos join al namespace asociado al canal seleccionado
                socket.on('selectChannel', function (data) {
                if (data && data.channelid) {
                        // Salimos del namespace asociado al canal si ya esta incluido en alguno
                        var roomName = 'CH_'+data.channelid;
                        for (var room in socket.adapter.rooms) {
                            if ((room.indexOf('CH_') == 0)) {
                                socket.leave(room);
                                console.log ("SOCKET(selectChannel):  "+socket.id+"(userid="+socket.userid+") leave room "+room);
                            }
                        }
                        socket.join(roomName);
                        socket.userid = data.userid;
                        console.log ("SOCKET(selectChannel) "+socket.id+"(userid="+socket.userid+") join to room "+roomName);
                    }
                });
                // Hacemos join al namespace asociado al usuario
                socket.on('newChatConnection', function (data) {
                    if (data && data.userid) {
                        // Salimos del namespace asociado al usuario
                        var roomName = 'US_'+data.userid;
                        for (var room in socket.adapter.rooms) {
                            if ((room.indexOf('US_') == 0))
                                console.log ("SOCKET(newChatConnection):  "+socket.id+"(userid="+socket.userid+") leave room "+room);
                                socket.leave(room);
                        }
                        socket.join(roomName);
                        socket.userid = data.userid;
                        console.log ("SOCKET(newChatConnection): "+socket.id+"(userid="+socket.userid+") join to room "+roomName);
                    }
                });
                socket.on('selectGroup', function (data) {
                    if (data && data.groupid && data.userid) {

                        var roomName = 'GR_'+data.groupid;
                        for (var room in socket.adapter.rooms) {
                            if ((room.indexOf('GR_') == 0) && (room != roomName)) {
                                // Notificamos a los conectados la desconexion
                                socket.to(room).broadcast.emit('userDisconnect', {userid: data.userid});
                                socket.leave(room);
                                console.log ("SOCKET(selectGroup):  "+socket.id+"(userid="+socket.userid+") leave room "+room);
                            }
                        }
                        // Notificamos a los conectados al grupo la nueva conexion al grupo
                        socket.join(roomName);
                        console.log ("SOCKET(selectGroup):  "+socket.id+"(userid="+socket.userid+") join to room "+roomName);
                        socket.userid = data.userid;
                        socket.broadcast.to(roomName).emit('newUserConnect', {userid: data.userid});

                        // Notificamos al usuario que se conecta, los usuarios ya conectados
                        var users = [];
                        var userid;
                        var socketid;
                        console.log ("SOCKET:get usersConnected in room " + roomName );
                        for (socketid in io.sockets.adapter.rooms[roomName]) {
                            console.log ("SOCKET "+socketid);
                            if ( io.sockets.connected[socketid]) {
                                userid = io.sockets.connected[socketid].userid;
                                console.log ("                --> connected (userid="+userid+")");
                                if (userid && userid != data.userid) {
                                    users.push(io.sockets.connected[socketid].userid);
                                }
                            }
                            else {
                                console.log ("                --> NOT connected ");
                            }

                        }
                        if (users.length > 0) {
                            socket.emit('usersConnected', {users: users});
                        }
                    }
                });
                socket.on('disconnect', function () {

                    console.log ("========== SOCKET(disconnect):  "+socket.id+"(userid="+socket.userid+") disconnect");
                    //Notificamos la desconexion de lso grupos en los que estuviera
                    for (var room in socket.adapter.rooms) {
                        if (room.indexOf('GR_') == 0) {
                            // Notificamos a los conectados la desconexion
                            socket.broadcast.to(room).emit('userDisconnect', {userid: socket.userid});
                            socket.leave(room);
                            console.log ("========== SOCKET(disconnect):  "+socket.id+"(userid="+socket.userid+") leave room "+room);
                        }
                    }
                });
            // Hacemos join al namespace asociado al canal seleccionado
            socket.on('disconnectChannel', function () {
                for (var room in socket.adapter.rooms ) {
                    if ((room.indexOf('CH_') == 0)) {
                        socket.leave(room);
                        console.log ("DISCONNECT FROM --->SOCKET(disconnectChannel):  "+socket.id+"(userid="+socket.userid+") leave room "+room);
                    }
                }
            });
            }
        );
    },
    getIO: function () {
      return io;
    },

    getUserSocket: getUserSocket,
    manageGroupChannelRooms: manageGroupChannelRooms,
    getUsersInSocket: getUsersInSocket


};




