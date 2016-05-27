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



    /*
     *
     * subject     : { type: String, required: true },
     createdby   : { type: Schema.ObjectId, ref: 'User', required: true },
     datetime    : { type: Date, default: Date.now },
     sprint      : { type: Schema.ObjectId, ref: 'Sprint', required: false },
     votes       : { type: Number, required: false },
     /* puedes hacerlo x rol*
     points      : {
     ux      : {type: Number, required: false},
     design  : {type: Number, required: false},
     front   : {type: Number, required: false},
     back    : {type: Number, required: false},
     },
     attachments : [{ type: String, required: false }],
     tasks       : [{ type: Schema.ObjectId, ref: 'Task', required: false }],
     tags        : [{ type: String, required: false }],
     status      : { type: String, default: 'NEW' },
     description : { type: String, required: false },
     /* team, client, blocked *
     requirement : { type: String, required: false },
     /* con el id de sobra *
     channel     : { type: Schema.ObjectId, ref: 'Channel', required: true }
     *
     *
     *
     * */




    /* el date time dejamos que sea null y que coja el date.now */

    var userstory = request.body.userstory;
    userstory.datetime = new Date();
    userstory.channel = channelid;
    userstory.createdby = userid;
    userstory.status = "New";

    /*var subject = request.body.subject;
    var createdby = request.body.createdby;
    var username = request.body.username;
    var username = request.body.username;
    var username = request.body.username;
    var username = request.body.username;
    var username = request.body.username;*/





    if(userid == undefined || userid == null ||
        channelid == undefined || channelid == null ||
        groupid == undefined || groupid == null){


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
                                userstoryservice.newuserstory (userstory).then(function (error, userstory) {
                                    if (error) {
                                        return promise.done(error, null);
                                    } else {

                                        console.log("esto vale el userstory creado");
                                        console.log(userstory);
                                        console.log("userstory successfully created... ");

                                        /* notif. al CH de nuevo userstory */
                                        socketio.getIO().sockets.to('CH_' + channelid).emit('newUserstory', {groupid: groupid, userstory: userstory});


                                        /* tengo que hacer 1 json para el mensaje */


                                        /* si el servicio devuelve null no se ha guardado bien en la bd el mensaje,
                                         * o no ha podido hacer busquedas para hacer emits
                                         * de todas formas se hace
                                         * esto no deberia pasar */

                                        /* he mandado el mensaje xsockets, con eso vale */

                                        /* text: JSON.stringify(message),*/

                                        /* mirar que me devuelve el user, importate*/
                                        console.log("este es el sender que ha hecho la accion en controllers/userstory");
                                        console.log(result);
                                        /* y mando el objeto entero xsiaca */

                                        console.log("esto vale el userstory que voy a meter en mensaje text en controller/userstory");
                                        console.log(userstory);

                                        /* quizas no habria que mandar all del userstory
                                         * mandamos mejor solo el id del userstory y si lo quieren ver que hagan 1 get y a correr */

                                        /* yo le meteria el userstory sin referencias externas */
                                        var messagetext = {
                                            action      : 'created',
                                            event       :  'userstory',
                                            sender      :   result


                                        };
                                        var partialuserstory = {
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

                                        messagetext.userstory.push(partialuserstory);


                                        messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {
                                            if(!error){
                                                console.log("NO HAY ERROR EN NEWINTERNAL MESSAJE");
                                                console.log("este esel mensaje guardado en la bd");
                                            }


                                            /* devuelvo el json cuando se haya hecho all */
                                            response.json(userstory);

                                        });











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





















