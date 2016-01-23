var io;
module.exports = {
    init: function (server) {
        io = require('socket.io').listen(server);

        io.on('connection', function (socket) {

                // Hacemos join al namespace asociado al canal para poder recibir los nuevos mensajes
                socket.on('selectChannel', function (data) {
                    if (data && data.channelid) {
                        // Salimos del namespace asociado al canal si ya esta incluido en alguno
                        var roomName = 'CH_'+data.channelid;
                        for (var room in socket.adapter.rooms) {
                            if ((room.indexOf('CH_') == 0) && (room != roomName))
                                socket.leave(room);
                        }

                        socket.join(roomName);
                    }
                });

                // Hacemos join al namespace asociado al usuario
                socket.on('newChatConnection', function (data) {
                    if (data && data.userid) {
                        // Salimos del namespace asociado al usuario
                        var roomName = 'US_'+data.userid;
                        for (var room in socket.adapter.rooms) {
                            if ((room.indexOf('US') == 0) && (room != roomName))
                                socket.leave(room);
                        }
                        socket.join(roomName);
                    }
                });

                socket.on('selectGroup', function (data) {
                    if (data && data.groupid && data.userid) {
                        // Salimos del namespace asociado al grupo si ya esta incluido en alguno
                        var roomName = 'GR_'+data.groupid;
                        for (var room in socket.adapter.rooms) {
                            if ((room.indexOf('GR_') == 0) && (room != roomName)) {
                                // Notificamos a los conectados la desconexion
                                socket.to(room).broadcast.emit('userDisconnect', {userid: data.userid});
                                socket.leave(room);
                            }
                        }
                        // Notificamos a los conectados al grupo la nueva conexion al grupo
                        socket.join(roomName);
                        socket.userid = data.userid;
                        socket.broadcast.to(roomName).emit('newUserConnect', {userid: data.userid});

                        // Notificamos al usuario que se conecta, los usuarios ya conectados
                        var users = [];
                        var userid;
                        for (socketid in io.sockets.adapter.rooms[roomName]) {
                            userid = io.sockets.connected[socketid].userid;
                            if (userid != data.userid) {
                                users.push(io.sockets.connected[socketid].userid);
                            }
                        }
                        if (users.length > 0) {
                            socket.emit('usersConnected', {users: users});
                        }
                    }
                });

                socket.on('disconnect', function () {
                    //Notificamos la desconexion de lso grupos en los que estuviera
                    for (var room in socket.adapter.rooms) {
                        if (room.indexOf('GR_') == 0) {
                            // Notificamos a los conectados la desconexion
                            socket.broadcast.to(room).emit('userDisconnect', {userid: socket.userid});
                            socket.leave(room);
                        }
                    }
                });

            }
        );
    },

    getIO: function () {
      return io;
    }
};




