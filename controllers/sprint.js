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




    if(userid == undefined || userid == null || userid == "undefined" || userid == "null" || userid == '' ||
        channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
        groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == ''){


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

            if(userid == undefined || userid == null || userid == "undefined" || userid == "null" || userid == '' ||
                channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
                groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == ''){


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

/* miramos que exista y lo modificamos */

exports.editsprint = function editsprint (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var sprintid = request.params.sprintid;



    var sprint = request.body;



    if(sprint == undefined || sprint == null || sprint == '' ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: sprint.'});

    }

    else {


        if(sprint.startdate == undefined || sprint.startdate == null || sprint.startdate == '' ||
            sprint.enddate == undefined || sprint.enddate == null || sprint.enddate == '' ||
            sprint.name == undefined || sprint.name == null || sprint.name == '' ){
            response.status(400).json({message: 'Bad Request. Missing required parameters: sprint.'});

        }

        else{


            if(userid == undefined || userid == null || userid == "undefined" || userid == "null" || userid == '' ||
                channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
                groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ||
                sprintid == undefined || sprintid == null || sprintid == "undefined" || sprintid == "null" || sprintid == ''){
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

                                        /* miramos que exista el sprint dentro del canal, porque puede existir pero no es propietario */
                                        sprintservice.checksprintexistsByIdCH(channelid, sprintid).then(function (error, sprintexists) {
                                            if (error) {
                                                response.status(error.code).json({message: error.message});
                                            }
                                            else {

                                                if (sprintexists == undefined || sprintexists == null || sprintexists == '') {
                                                    var err = {
                                                        code: 402,
                                                        message: "Sprint to update not found inside channel requested."
                                                    };
                                                    response.status(err.code).json({message: err.message});

                                                }
                                                else {


                                                    sprintservice.updatesprint(sprint, sprintid).then(function (error, sprintresultnew) {
                                                        if (error) {
                                                            response.status(error.code).json({message: error.message});
                                                        }
                                                        else {


                                                            /* puedo comparar que ha cambiado:: si han cambiado las fechas decirlo  */

                                                            socketio.getIO().sockets.to('CH_' + channelid).emit('updateSprint', {sprint: sprintresultnew});


                                                            /* tengo que hacer 1 json para el mensaje **********************/
                                                            var messagetext = createJSONmsgTask.generateMSGEditSprint(result, sprintexists, sprintresultnew);


                                                            messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                response.json({
                                                                    sprint: sprintresultnew,
                                                                    message: 'Sprint updated successfully'
                                                                });


                                                            });





                                                        }/* !error updateUSsforsprint */
                                                    }); /* updatesprint */





                                                } /* end else existe el sprint y no es null */
                                            } /* end else no hay error al buscar el Sprint en el canal */

                                        }); /* buscamos el sprint en el canal */



                                    } /* end else !err */
                                }); /* method checkuserinchannel */

                        } /* end el token es del usuario */

                        else {
                            response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
                        }

                    } /* end else !err */
                }); /* method Auth */


            } /* end else URL params exists */

        }







    }




};






exports.deletesprint = function deletesprint (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var sprintid = request.params.sprintid;




    if(userid == undefined || userid == null || userid == "undefined" || userid == "null" || userid == '' ||
        channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
        groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ||
        sprintid == undefined || sprintid == null || sprintid == "undefined" || sprintid == "null" || sprintid == ''){

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

                                /* miramos que exista el sprint dentro del canal, porque puede existir pero no es propietario */
                                sprintservice.checksprintexistsByIdCH(channelid, sprintid).then(function (error, sprintexists) {
                                    if (error) {
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {

                                        if (sprintexists == undefined || sprintexists == null || sprintexists == '') {
                                            var err = {
                                                code: 402,
                                                message: "Sprint to delete not found inside channel requested."
                                            };
                                            response.status(err.code).json({message: err.message});

                                        }
                                        else {
                                            /* existe, se puede borrar, desvinculamos US y
                                             * luego borramos sprint, para no perder las US si hay algun problema */
                                            /* hay que buscar US que tengan x sprint sprintid */

                                            /* tenemos el sprint, y ahora los US modificados en una respuesta raw
                                            * no sabemos que devuleve, luego crearemos el mensaje en funcion de ello */

                                            userstoryservice.updateuserstoriesFromSprint(sprintid).then(function (error, raw) {
                                                if (error) {
                                                    response.status(error.code).json({message: error.message});
                                                }
                                                else {


                                                    sprintservice.deletesprintById (sprintid)
                                                        .then(function (error, sprintresultid) {
                                                            if (error) {

                                                                response.status(error.code).json({message: error.message});
                                                            }

                                                            else {

                                                                socketio.getIO().sockets.to('CH_' + channelid).emit('deleteSprint', {sprintid: sprintid});


                                                                /* tengo que hacer 1 json para el mensaje **********************/
                                                                var messagetext = createJSONmsgTask.generateMSGDeleteSprint(result, sprintexists, raw);


                                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                    response.json({
                                                                        sprintid: sprintid,
                                                                        message: 'Sprint deleted successfully'
                                                                    });


                                                                });



                                                            }
                                                        }); /* delete sprintby id */


                                                }/* !error updateUSsforsprint */
                                            }); /* updateUSsfromsprint */





                                        } /* end else existe el sprint y no es null */
                                    } /* end else no hay error al buscar el Sprint en el canal */

                                }); /* buscamos el sprint en el canal */



                            } /* end else !err */
                        }); /* method checkuserinchannel */

                } /* end el token es del usuario */

                else {
                    response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
                }

            } /* end else !err */
        }); /* method Auth */


    } /* end else URL params exists */



};
