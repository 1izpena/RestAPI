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

                            chatErrors.checkuserinchannel(channelid,userid)
                                .then (function (error,channel) {
                                    if (error) {
                                        response.status(401).json({message: 'User not included in requested channel'});
                                    }
                                    else {
                                        /* existe y el usuario esta en el */
                                        /* entonces procedemos a guardar el userstory */


                                        /* userstoryresult devuelve 1 array */
                                        userstoryservice.newuserstory (userstory).then(function (error, userstoryresult) {
                                            if (error) {
                                                response.status(error.code).json({message: error.message});
                                            } else {

                                                console.log("userstory successfully created... ");

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
    var codepoints = changesinuserstory.codepoints;



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
                var answer = userstoryErrors.checkfields(userstory, fieldchange);

                if(answer.num == 0){
                    /* hay error */
                    response.status(answer.err.code).json({message: answer.err.message });
                }
                else{


                    var codefield = answer.num;


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

                                            /* userstoryresult devuelve 1 array */
                                            userstoryservice.updateuserstoryById (userstoryid, userstory, codefield).then(function (error, userstoryresult) {
                                                if (error) {
                                                    response.status(error.code).json({message: error.message});
                                                } else {

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
                                                        point       : userstoryresult.point,
                                                        totalPoints : userstoryresult.totalPoints,
                                                        description : userstoryresult.description,
                                                        requirement : userstoryresult.requirement
                                                    };


                                                    /* point, tags, requirement*/
                                                    if(messagetext.field == 2 ||
                                                        messagetext.field == 5 ||
                                                        messagetext.field == 7){
                                                        if(codepoints !== undefined &&
                                                            codepoints !== null &&
                                                            codepoints !== '' ){
                                                            messagetext.codepoints = codepoints;


                                                        }
                                                    }


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





                } /* else answer.num !== 0, no hay error */



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
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {

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





















