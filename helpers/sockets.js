var io;
module.exports = {
    init: function (server) {
        io = require('socket.io').listen(server);

        io.on('connection', function (socket) {

                // Hacemos join al namespace asociado al canal para poder recibir los nuevos mensajes
                socket.on('selectChannel', function (data) {
                    if (data && data.channelid) {
                        socket.join(data.channelid);
                    }
                });

            }
        );
    },

    getIO: function () {
      return io;
    }
}




