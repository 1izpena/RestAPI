/**
 * Created by izaskun on 25/05/16.
 */

'use strict';



var Auth  = require('../helpers/authentication');

var channelservice  = require('../services/channel');
var userstoryservice  = require('../services/userstory');
var messageservice  = require('../services/message');


var chatErrors  = require('../helpers/chatErrorsHandler');

var socketio  = require('../helpers/sockets');
var io = require('socket.io');



/* faltan sockets */
exports.newuserstory = function newuserstory (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;


    var userstory = request.body;
    userstory.datetime = new Date();
     userstory.channel = channelid;
     userstory.createdby = userid;
     userstory.status = "New";



    console.log("esto vale userstory");
    console.log(userstory);


    if(userstory == undefined || userstory == null || userstory == '' ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: userstory.'});

    }
    else {

        if(userstory.subject == undefined || userstory.subject == null || userstory.subject == ''){
            response.status(400).json({message: 'Bad Request. Missing required parameters: subject.'});

        }
        else {

            if(userid == undefined || userid == null || userid == '' ||
                channelid == undefined || channelid == null || channelid == '' ||
                groupid == undefined || groupid == null || groupid == '' ){


                response.status(400).json({message: 'Bad Request. Missing required parameters in URL.'});

            }
            else{
                Auth(request, response).then(function(error, result) {
                    if(error) {
                        response.status(error.code).json({message: error.message});
                    }
                    else {
                        if (userid == result._id){

                            /* primero buscamos que exista el canal y el usuario pertenezca */
                            chatErrors.checkuserinchannel(channelid,userid)
                                .then (function (error,channel) {
                                    if (error) {
                                        response.status(401).json({message: 'User not included in requested channel'});
                                    }
                                    else {
                                        /* existe y el usuario esta en el */
                                        /* entonces procedemos a guardar el userstory */
                                        /* mirar que devuelve channel */
                                        console.log("ESTO VALE CHANNEL PARA CREAR USERSTORY");
                                        console.log(channel);

                                        userstoryservice.newuserstory (userstory).then(function (error, userstory) {
                                            if (error) {
                                                return promise.done(error, null);
                                            } else {

                                                console.log("esto vale el userstory creado");
                                                console.log(userstory);
                                                console.log("userstory successfully created... ");

                                                /* notif. al CH de nuevo userstory */
                                                /*socketio.getIO().sockets.to('CH_' + channelid).emit('newUserstory', {groupid: groupid, userstory: userstory});*/
                                                socketio.getIO().sockets.to('CH_' + channelid).emit('newUserstory', {userstory: userstory});


                                                /* tengo que hacer 1 json para el mensaje */

                                                /* si el servicio devuelve null no se ha guardado bien en la bd el mensaje,
                                                 * o no ha podido hacer busquedas para hacer emits
                                                 * de todas formas se hace
                                                 * esto no deberia pasar */

                                                /* he mandado el mensaje xsockets, con eso vale */

                                                /* text: JSON.stringify(message),*/



                                                var sender = {
                                                    id  : result._id,
                                                    name: result.username,
                                                    mail: result.mail
                                                };



                                                console.log("esto vale el userstory que voy a meter en mensaje text en controller/userstory");
                                                console.log(userstory);

                                                /* quizas no habria que mandar all del userstory
                                                 * mandamos mejor solo el id del userstory y si lo quieren ver que hagan 1 get y a correr */

                                                /* yo le meteria el userstory sin referencias externas */
                                                var messagetext = {
                                                    action      : 'created',
                                                    event       :  'userstory',
                                                    sender      :   sender

                                                };

                                                messagetext.userstory = {
                                                    id          : userstory.id,
                                                    num         : userstory.num,
                                                    subject     : userstory.subject,
                                                    tags        : userstory.tags,
                                                    status      : userstory.status,
                                                    votes       : userstory.votes,
                                                    points      : userstory.points,
                                                    description : userstory.description,
                                                    requirement : userstory.requirement
                                                };



                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {
                                                    if(!error){
                                                        console.log("NO HAY ERROR EN NEWINTERNAL MESSAJE");
                                                        console.log("este esel mensaje guardado en la bd");
                                                    }


                                                    /* devuelvo el json cuando se haya hecho all */
                                                    response.json(userstory);

                                                });


                                            } /* end else !err */
                                        }); /* method newuserstory */

                                    } /* end else !err */
                                }); /* method checkuserinchannel */

                        } /* end el token es del usuario */

                        else {
                            response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
                        }

                    } /* end else !err */
                }); /* method Auth */

            } /* end else URL params exists */
        } /* end else userstory.subject == undefined */
    } /* end else userstory == undefined */


};










exports.getuserstories = function getuserstories (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;




    if(userid == undefined || userid == null ||
        channelid == undefined || channelid == null ||
        groupid == undefined || groupid == null){


        response.status(400).json({message: 'Bad Request. Missing required parameters in URL.'});

    }
    else {

        Auth(request, response).then(function(error, result) {
            if(error) {
                response.status(error.code).json({message: error.message});
            }
            else {
                if (userid == result._id){

                    /* primero buscamos que exista el canal y el usuario pertenezca */
                    chatErrors.checkuserinchannel(channelid,userid)
                        .then (function (error,channel) {
                            if (error) {
                                response.status(401).json({message: 'User not included in requested channel'});
                            }
                            else {
                                /* existe y el usuario esta en el */
                                /* entonces procedemos a recoger los userstories */
                                userstoryservice.getuserstories (channelid).then(function (error, userstories) {
                                    if (error) {
                                        return promise.done(error, null);
                                    }
                                    else {

                                        console.log("esto valen los userstories devueltos");
                                        console.log(userstories);
                                        response.json(userstories);




                                    }
                                });


                            }
                        });


                }
                else {
                    response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
                }



            }
        });

    }


};





















