/**
 * Created by izaskun on 29/05/16.
 */




'use strict';



var Auth  = require('../helpers/authentication');

var channelservice  = require('../services/channel');
var issueservice  = require('../services/issue');
var messageservice  = require('../services/message');


var chatErrors  = require('../helpers/chatErrorsHandler');
var createJSONmsgTask  = require('../helpers/createJSONmsgTask');


var socketio  = require('../helpers/sockets');
var io = require('socket.io');



exports.getissues = function getissues (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;




    if(userid == undefined || userid == null || userid == "undefined" || userid == "null" ||userid == '' ||
        channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
        groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ){


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
                                issueservice.getissues (channelid).then(function (error, issues) {
                                    if (error) {
                                        return promise.done(error, null);
                                    }
                                    else {

                                        console.log("esto valen las issues devueltas");
                                        console.log(issues);
                                        response.json(issues);




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



exports.newissue = function newissue (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;


    var issue = request.body;


    if(issue == undefined || issue == null || issue == '' ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: issue.'});

    }
    else {


        if(issue.subject == undefined || issue.subject == null || issue.subject == ''){
            response.status(400).json({message: 'Bad Request. Missing required parameters: subject.'});

        }
        else {

            if(userid == undefined || userid == null || userid == "undefined" || userid == "null" ||userid == '' ||
                channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
                groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ){


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
                                        /* entonces procedemos a guardar la issue */

                                        issue.datetime = new Date();
                                        issue.channel = channelid;
                                        issue.createdby = userid;




                                        issueservice.newissue (issue).then(function (error, issueresult) {
                                            if (error) {
                                                response.status(error.code).json({message: error.message});
                                            } else {

                                                console.log("issue successfully created... ");

                                                /* notif. al CH de nuevo userstory */
                                                socketio.getIO().sockets.to('CH_' + channelid).emit('newIssue', {issue: issueresult});


                                                /* tengo que hacer 1 json para el mensaje */
                                                var messagetext = createJSONmsgTask.generateMSGNewIssue(result, issueresult, null);



                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                    /* devuelvo el json cuando se haya hecho all */
                                                    response.json(issueresult);

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
