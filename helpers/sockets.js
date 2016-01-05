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

            }
        );
    },

    getIO: function () {
      return io;
    }
}




