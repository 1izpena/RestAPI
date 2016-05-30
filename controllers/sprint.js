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
