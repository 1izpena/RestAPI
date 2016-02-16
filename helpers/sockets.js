var channelservice  = require('../services/channel');

var io;
module.exports = {
    init: function (server) {
        io = require('socket.io').listen(server);

        io.on('connection', function (socket) {
                console.log ("========== SOCKET: new socket conection. socketid = "+socket.id)

                // Hacemos join al namespace asociado al canal para poder recibir los nuevos mensajes
                /*
                socket.on('selectChannel', function (data) {
                    if (data && data.channelid) {
                        // Salimos del namespace asociado al canal si ya esta incluido en alguno
                        var roomName = 'CH_'+data.channelid;
                        for (var room in socket.adapter.rooms) {
                            if ((room.indexOf('CH_') == 0) && (room != roomName))
                                socket.leave(room);
                                console.log("ha dejado socket de select channel");
                        }
                        console.log("se ha unido a socket de select channel");
                        socket.join(roomName);
                        socket.userid = data.userid;
                    }
                });*/

                // Hacemos join al namespace asociado al usuario
                socket.on('newChatConnection', function (data) {
                    if (data && data.userid) {
                        // Cargamos el userid en el socket
                        socket.userid = data.userid;

                        // Hacemos un join a un canal asociado al usuario para recibir notificaciones
                        var roomName = 'US_'+data.userid;
                        socket.join(roomName);
                        console.log ("========== SOCKET "+socket.id+"(userid="+socket.userid+") join to room "+roomName);


                        // Buscamos todos los canales a los que tiene acceso el usuario
                        // y nos suscribimos
                        channelservice.getallgroupschannellist(data.userid).then(function (error,channels){
                            if(!error){
                                var roomName;
                                for (var i=0; i < channels.length; i++) {
                                    roomName = 'CH_'+channels[i].id;
                                    socket.join(roomName);
                                    console.log ("========== SOCKET "+socket.id+"(userid="+socket.userid+") join to room "+roomName);
                                }
                            }
                        });

                    }
                });

                socket.on('selectGroup', function (data) {
                    if (data && data.groupid && data.userid) {

                        console.log ("========== SOCKET:  selectGroup ");

                        // Salimos del namespace asociado al grupo si ya esta incluido en alguno
                        var roomName = 'GR_'+data.groupid;
                        var room;
                        for (var i=0; i <  socket.rooms.length; i++) {
                            room = socket.rooms[i];
                            if ((room.indexOf('GR_') == 0) && (room != roomName)) {
                                // Notificamos a los conectados la desconexion
                                socket.to(room).broadcast.emit('userDisconnect', {userid: data.userid});
                                socket.leave(room);
                                console.log ("========== SOCKET:  "+socket.id+"(userid="+socket.userid+") leave room "+room);
                            }
                        }
                        // Notificamos a los conectados al grupo la nueva conexion al grupo
                        socket.join(roomName);
                        console.log ("========== SOCKET:  "+socket.id+"(userid="+socket.userid+") join to room "+roomName);
                        socket.userid = data.userid;
                        socket.broadcast.to(roomName).emit('newUserConnect', {userid: data.userid});

                        // Notificamos al usuario que se conecta, los usuarios ya conectados
                        var users = [];
                        var userid;

                        console.log ("========== SOCKET:  get usersConnected in room " + roomName );
                        for (socketid in io.sockets.adapter.rooms[roomName]) {
                            console.log ("========== SOCKET "+socketid);
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

                    console.log ("========== SOCKET:  "+socket.id+"(userid="+socket.userid+") disconnect");
                    //Notificamos la desconexion de lso grupos en los que estuviera
                    for (var i=0; i <  socket.rooms.length; i++) {
                        room = socket.rooms[i];
                        if (room.indexOf('GR_') == 0) {
                            // Notificamos a los conectados la desconexion
                            socket.broadcast.to(room).emit('userDisconnect', {userid: socket.userid});
                            socket.leave(room);
                            console.log ("========== SOCKET:  "+socket.id+"(userid="+socket.userid+") leave room "+room);
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




