/**
 * Created by izaskun on 29/05/16.
 */

'use strict';



var Auth  = require('../helpers/authentication');

var channelservice  = require('../services/channel');
var userstoryservice  = require('../services/userstory');
var sprintservice  = require('../services/sprint');


var messageservice  = require('../services/message');


var chatErrors  = require('../helpers/chatErrorsHandler');

var socketio  = require('../helpers/sockets');
var io = require('socket.io');
var createJSONmsgTask  = require('../helpers/createJSONmsgTask');






exports.getsprints = function getsprints (request, response){

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
                                sprintservice.getsprints (channelid).then(function (error, sprints) {
                                    if (error) {
                                        return promise.done(error, null);
                                    }
                                    else {

                                        console.log("esto valen los sprints devueltos");
                                        console.log(sprints);
                                        response.json(sprints);




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





exports.newsprint = function newsprint (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;


    var sprint = request.body;


    if(sprint == undefined || sprint == null || sprint == '' ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: sprint.'});

    }
    else {

        sprint.datetime = new Date();
        sprint.channel = channelid;
        sprint.createdby = userid;




        if(sprint.name == undefined || sprint.name == null || sprint.name == ''){
            response.status(400).json({message: 'Bad Request. Missing required parameters: name.'});

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


                                        sprintservice.newsprint (sprint).then(function (error, sprintresult) {
                                            if (error) {
                                                response.status(error.code).json({message: error.message});
                                            } else {

                                                console.log("sprint successfully created... ");

                                                /* notif. al CH de nuevo userstory */
                                                socketio.getIO().sockets.to('CH_' + channelid).emit('newSprint', {sprint: sprintresult});


                                                /* tengo que hacer 1 json para el mensaje */
                                                var messagetext = createJSONmsgTask.generateMSGNewSprint(result, sprintresult);



                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                    /* devuelvo el json cuando se haya hecho all */
                                                    response.json(sprintresult);

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
