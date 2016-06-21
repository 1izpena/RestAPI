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
var issueservice  = require('../services/issue');
var createJSONmsgTask  = require('../helpers/createJSONmsgTask');


async = require("async");


var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var Message  = require('../models/message');
var Userstory  = require('../models/userstory');

var Hope  = require('hope');


exports.newinternalcomment = function newinternalcomment(result, newissueresult, userstoryresult, channelid){



    var promise = new Hope.Promise();


    var User = mongoose.model('User');
    User.search({mail: config.internalUserMail}, 1)
        .then(function(error, internalUser) {
            if (!error) {

                console.log("esto vale internal user");
                console.log(internalUser);



                var message = {};
                message.userstory = {
                    id: userstoryresult.id,
                    num: userstoryresult.num,
                    subject: userstoryresult.subject,


                };

                message.sender = {
                    id: result._id,
                    username: result.username,
                    mail: result.mail,


                };



                var comment = {};
                comment.created = new Date();
                comment._user = internalUser._id;
                comment.comment = JSON.stringify(message);
                fieldnewvalue = comment;


                var answer = {};
                answer.num = 4;

                issueservice.updateissue(newissueresult.id, answer.num, fieldnewvalue).then(function (error, newissueresultwithcomment) {
                    if (error) {
                        response.status(error.code).json({message: error.message});
                    }
                    else {

                        /* notificamos al CH de que ha cambiado el userstory ******************/
                        socketio.getIO().sockets.to('CH_' + channelid).emit('updateIssue', {issue: newissueresultwithcomment});


                        var fieldchange = "comments";
                        answer.num = 13;
                        var messagetext = createJSONmsgTask.generateMSGupdateIssue(answer.num, internalUser, null,
                            fieldchange, newissueresult, null, null);






                        /* aqui haria lo del nuevo comentario */
                        return promise.done(null, messagetext);





                        /* ahora generamos el mensaje, no comment xq no esta preparado */








                        /*if (answer.num !== 5) {
                         /* tengo que hacer 1 json para el mensaje *
                         var messagetext = createJSONmsgTask.generateMSGupdateIssue(answer.num, result, fieldoldvalue,
                         fieldchange, newissueresult, fieldnewvalue, issueresult);


                         messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {
                         response.json(newissueresult);

                         });

                         }
                         else {
                         response.json(newissueresult);

                         }*/


                    }
                    /* else !error*/
                });













            }
            else {


                return promise.done(error, null);
            }




        });
    return promise;







};


exports.newinternalmessage = function newinternalmessage(message, channelid){

    var promise = new Hope.Promise();

    /* tengo que hacerme 1 json */

    /* no he cambiado nada respecto al otro, se podria reutilizar para githubapi
    * solo que devuelve promises */

    var User = mongoose.model('User');
    User.search({mail: config.internalUserMail}, 1)
        .then(function(error, internalUser) {
            if(!error){



                /* aqui bien
                console.log("esto vale channelid antes de hacer el search");
                console.log(channelid);
                */


                var query = {_id: channelid};

                var Channel = mongoose.model('Channel');
                Channel.search(query, 1).then(function(error, channel) {
                    if (!error) {





                        /* tengo el user y el canal */
                        /* esto esta mal me devuelve otra cosa */
                        /*console.log("esto vale channel.id");
                        console.log(channel.id);*/
                        /*console.log("esto vale mensaje a guardar en bd en el servicio");
                        console.log(message);*/

                        var messageData = {
                            channelid: channel.id,
                            userid: internalUser._id,
                            messageType: 'TEXT',
                            text: JSON.stringify(message),
                            serviceType : 'SCRUM'


                        };

                        /*console.log("esto vale mensaje CON all a guardar en bd en el servicio");
                        console.log(messageData);*/

                        console.log("en services/message esto vale messageData text");
                        console.log(messageData.text);


                        var Message = mongoose.model('Message');
                        Message.newMessage(messageData).then(function newmessage(error, result) {
                            /*console.log("estoes lo que responde newmessage con result y error");
                            console.log("error");
                            console.log(error);*/


                            /*console.log("result");
                            console.log(result);*/

                            if (!error) {


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












