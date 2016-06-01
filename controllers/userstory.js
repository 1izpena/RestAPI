/**
 * Created by izaskun on 25/05/16.
 */

'use strict';



var Auth  = require('../helpers/authentication');

var channelservice  = require('../services/channel');
var userstoryservice  = require('../services/userstory');
var messageservice  = require('../services/message');


var chatErrors  = require('../helpers/chatErrorsHandler');
var userstoryErrors  = require('../helpers/userstoryErrorsHandler');

var socketio  = require('../helpers/sockets');
var io = require('socket.io');




exports.newuserstory = function newuserstory (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;


    var userstory = request.body;


    /*console.log("esto vale userstory");
    console.log(userstory);*/


    if(userstory == undefined || userstory == null || userstory == '' ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: userstory.'});

    }
    else {

        userstory.datetime = new Date();
        userstory.channel = channelid;
        userstory.createdby = userid;
        /*userstory.status = "New";*/




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

                            /*console.log("esto vale channelid antes de checkuser en channel");
                            console.log(channelid);*/
                            chatErrors.checkuserinchannel(channelid,userid)
                                .then (function (error,channel) {
                                    if (error) {
                                        response.status(401).json({message: 'User not included in requested channel'});
                                    }
                                    else {
                                        /* existe y el usuario esta en el */
                                        /* entonces procedemos a guardar el userstory */

                                        /*console.log("esto vale channel despues de checkinchannel");
                                        console.log(channel);*/

                                        console.log("esto vale userstory antes de mandar a guardar");
                                        console.log(userstory);


                                        /* userstoryresult devuelve 1 array */
                                        userstoryservice.newuserstory (userstory).then(function (error, userstoryresult) {
                                            if (error) {
                                                return promise.done(error, null);
                                            } else {

                                                console.log("userstory successfully created... ");

                                                console.log("este es el userstoryresult que devuelve el metodo de creacion");

                                                console.log(userstoryresult);
                                                /* notif. al CH de nuevo userstory */
                                                /*socketio.getIO().sockets.to('CH_' + channelid).emit('newUserstory', {groupid: groupid, userstory: userstory});*/
                                                socketio.getIO().sockets.to('CH_' + channelid).emit('newUserstory', {userstory: userstoryresult});


                                                /* tengo que hacer 1 json para el mensaje */

                                                /* si el servicio devuelve null no se ha guardado bien en la bd el mensaje,
                                                 * o no ha podido hacer busquedas para hacer emits
                                                 * de todas formas se hace
                                                 * esto no deberia pasar */

                                                /* he mandado el mensaje xsockets, con eso vale */

                                                /* text: JSON.stringify(message),*/



                                                var sender = {
                                                    id  : result._id,
                                                    username: result.username,
                                                    mail: result.mail
                                                };



                                                /* quizas no habria que mandar all del userstory
                                                 * mandamos mejor solo el id del userstory y si lo quieren ver que hagan 1 get y a correr */

                                                /* yo le meteria el userstory sin referencias externas */
                                                var messagetext = {
                                                    action      : 'created',
                                                    event       :  'userstory',
                                                    sender      :   sender

                                                };

                                                messagetext.userstory = {
                                                    id          : userstoryresult.id,
                                                    num         : userstoryresult.num,
                                                    subject     : userstoryresult.subject,
                                                    tags        : userstoryresult.tags,
                                                    status      : userstoryresult.status,
                                                    /* array con id de user*/
                                                    /* si dejo hacerlo en la creacion */
                                                    voters      : userstoryresult.voters,
                                                    points      : userstoryresult.points,
                                                    totalPoints : userstoryresult.totalPoints,
                                                    description : userstoryresult.description,
                                                    requirement : userstoryresult.requirement
                                                };


                                                console.log("esto vale el userstory que voy a meter en mensaje text en controller/userstory");
                                                console.log(messagetext.userstory);

                                                /*console.log("en el controller esto vale channelid");
                                                console.log(channelid);*/

                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                    /* devuelvo el json cuando se haya hecho all */
                                                    response.json(userstoryresult);

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


/** updateuserstory **/
exports.updateuserstory = function updateuserstory (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var userstoryid = request.params.userstoryid;


    var changesinuserstory = request.body;
    var userstory = changesinuserstory.userstory;
    var fieldchange = changesinuserstory.field;

    console.log("esto vale changesinuserstory");
    console.log(changesinuserstory);

    console.log("esto vale userstory");
    console.log(userstory);

    console.log("esto vale fieldchange");
    console.log(fieldchange);



    if(userstory == undefined || userstory == null || userstory == '' ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: userstory.'});
    }
    else {
        if(fieldchange == undefined || fieldchange == null || fieldchange == ''){
            response.status(400).json({message: 'Bad Request. Missing required parameters: field that changed.'});
        }
        else {
            if(userid == undefined || userid == null || userid == '' ||
                channelid == undefined || channelid == null || channelid == '' ||
                groupid == undefined || groupid == null || groupid == '' ||
                userstoryid == undefined || userstoryid == null || userstoryid == '' ){
                response.status(400).json({message: 'Bad Request. Missing required parameters in URL.'});
            }
            else{

                /* entonces mirar que existen los atributos de ese userstory en lo que pone que ha cambiado */
                userstoryErrors.checkfields(userstory, fieldchange)
                    .then (function (error,codefield) {
                        if (error) {
                            response.status(error.code).json({message: error.message });
                        }
                        else {

                            var codefield = codefield;


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
                                                    /* entonces procedemos a updatear el userstory */
                                                    console.log("esto vale userstory antes de mandar a guardar");
                                                    console.log(userstory);

                                                    console.log("esto vale codefield antes de mandar a guardar");
                                                    console.log(codefield);


                                                    /* userstoryresult devuelve 1 array */
                                                    userstoryservice.updateuserstoryById (userstoryid, userstory, codefield).then(function (error, userstoryresult) {
                                                        if (error) {
                                                            return promise.done(error, null);
                                                        } else {

                                                            console.log("userstory successfully updated... ");

                                                            console.log("este es el userstoryresult que devuelve el metodo de update");
                                                            console.log(userstoryresult);


                                                            socketio.getIO().sockets.to('CH_' + channelid).emit('updateUserstory', {userstory: userstoryresult});


                                                            /* tengo que hacer 1 json para el mensaje */

                                                            /* si el servicio devuelve null no se ha guardado bien en la bd el mensaje,
                                                             * o no ha podido hacer busquedas para hacer emits
                                                             * de todas formas se hace
                                                             * esto no deberia pasar */

                                                            /* he mandado el mensaje xsockets, con eso vale */

                                                            /* text: JSON.stringify(message),*/



                                                            var sender = {
                                                                id  : result._id,
                                                                username: result.username,
                                                                mail: result.mail
                                                            };



                                                            /* quizas no habria que mandar all del userstory
                                                             * mandamos mejor solo el id del userstory y si lo quieren ver que hagan 1 get y a correr */

                                                            /* yo le meteria el userstory sin referencias externas */
                                                            var messagetext = {
                                                                action      :  'updated',
                                                                field       :   codefield,
                                                                event       :  'userstory',
                                                                sender      :   sender

                                                            };

                                                            messagetext.userstory = {
                                                                id          : userstoryresult.id,
                                                                num         : userstoryresult.num,
                                                                subject     : userstoryresult.subject,
                                                                tags        : userstoryresult.tags,
                                                                status      : userstoryresult.status,
                                                                /* array con id de user*/
                                                                /* si dejo hacerlo en la creacion */
                                                                voters      : userstoryresult.voters,
                                                                points      : userstoryresult.points,
                                                                totalPoints : userstoryresult.totalPoints,
                                                                description : userstoryresult.description,
                                                                requirement : userstoryresult.requirement
                                                            };


                                                            console.log("esto vale el userstory que voy a meter en mensaje text en controller/userstory");
                                                            console.log(messagetext.userstory);

                                                            /*console.log("en el controller esto vale channelid");
                                                             console.log(channelid);*/

                                                            messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                /* devuelvo el json cuando se haya hecho all */
                                                                response.json(userstoryresult);

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








                        }/* end else error */


                    }); /*  method userstoryErrors */


            } /* end else URL params exists */
        } /* end else userstory.subject == undefined */
    } /* end else userstory == undefined */


};













/************************************************************************/


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

                                        /*console.log("esto valen los userstories devueltos");
                                        console.log(userstories);*/
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





















