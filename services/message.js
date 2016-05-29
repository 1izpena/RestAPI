/**
 * Created by izaskun on 25/05/16.
 */



var Hope  = require('hope');


var config = require('../config');
var githubHandler = require('../helpers/githubHandler');

var mongoose = require('mongoose');
var socketio  = require('../helpers/sockets');
var io = require('socket.io');


var channelservice  = require('../services/channel');
async = require("async");


var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var Message  = require('../models/message');
var Userstory  = require('../models/userstory');

var Hope  = require('hope');





exports.newinternalmessage = function newinternalmessage(message, channelid){

    var promise = new Hope.Promise();

    /* tengo que hacerme 1 json */

    /* no he cambiado nada respecto al otro, se podria reutilizar para githubapi
    * solo que devuelve promises */

    var User = mongoose.model('User');
    User.search({mail: config.internalUserMail}, 1)
        .then(function(error, internalUser) {
            if(!error){

                console.log("NO ERROR en services/message search internal user");


                var Channel = mongoose.model('Channel');
                Channel.search(channelid, 1).then(function(error, channel) {
                    if (!error) {

                        console.log("entro en channel search !error");
                        console.log("esto vale channel");
                        console.log(channel);



                        /* tengo el user y el canal */
                        console.log("esto vale channel.id");
                        console.log(channel.id);

                        var messageData = {
                            channelid: channel.id,
                            userid: internalUser.id,
                            messageType: 'TEXT',
                            text: JSON.stringify(message),
                            serviceType : 'SCRUM'


                        };


                        var Message = mongoose.model('Message');
                        Message.newMessage(messageData).then(function newmessage(error, result) {
                            if (!error) {

                                /*console.log("esto vale el id del grupo ");
                                console.log(channel.group);



                                console.log("esto vale el result de newMessage");
                                console.log(result);


                                console.log("esto vale groupid que vamos a mandar : ");
                                console.log(channel.group);

                                console.log("esto vale el channelid que vamos a mandar :");
                                console.log(messageData.channelid);*/

                                socketio.getIO().sockets.to('CH_' + messageData.channelid).emit('newMessage', {groupid: channel.group, message: result});


                                /* hace esto para meter los usuarios */
                                Channel.parsepopulated(messageData.channelid).then(function (error, channel) {
                                    if (error){

                                        return promise.done(null, null);
                                    }

                                    else {

                                        /* tengo que conseguir en nombre del grupo */
                                        var Group = mongoose.model('Group');

                                        /*console.log("esto vale channel channel.group");
                                        console.log(channel);*/


                                        console.log("channelType: " + channel.channelType);
                                        var roomName = 'CH_'+channel.id;

                                        /* cogemos a los usuarios del canal */
                                        for (var j=0;j<channel.users.length;j++){

                                            var encontrado = false;

                                            for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {

                                                if ( socketio.getIO().sockets.connected[socketid]) {
                                                    var connectedUser = socketio.getIO().sockets.connected[socketid].userid;

                                                    if (connectedUser && connectedUser == channel.users[j].id ) {
                                                        encontrado = true;
                                                    }
                                                }
                                            }


                                            /********************************/
                                            if (encontrado == false ){
                                                console.log("Emit newMessageEvent");

                                                socketio.getIO().sockets.to('US_'+ channel.users[j].id).emit('newMessageEvent',
                                                    {groupid: channel.group.groupId,  groupName: channel.group.groupName ,
                                                        channelName: channel.channelName, channelid: channel.id,
                                                        channelType: channel.channelType, message: result});
                                            }
                                        }

                                        /* result es el mensaje */
                                        return promise.done(null, result);



                                    }

                                });  /* channel parse populated */


                            }

                            else{
                                console.log("entro en guardar mensaje:: newmessage:: con error");
                                console.log(error);
                                return promise.done(null, null);
                            }

                        });/* end save message */



                        /********************** end new ***********************************/


                    } /************ si distinto de error en buscar canal ************/


                    else {

                        console.log("entro en channel search con error");
                        console.log(error);

                        return promise.done(null, null);
                    }


                });


            } /* end if user.search !error */
            else{

                console.log("entro en user search con error");
                console.log(error);
                return promise.done(null, null);
            }






        });

    return promise;







};












