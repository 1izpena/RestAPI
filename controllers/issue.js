/**
 * Created by izaskun on 29/05/16.
 */




'use strict';



var Auth  = require('../helpers/authentication');

var channelservice  = require('../services/channel');
var issueservice  = require('../services/issue');
var messageservice  = require('../services/message');
var userstoryservice  = require('../services/userstory');


var chatErrors  = require('../helpers/chatErrorsHandler');
var createJSONmsgTask  = require('../helpers/createJSONmsgTask');
var issueErrors = require('../helpers/issueErrorsHandler');

var socketio  = require('../helpers/sockets');
var io = require('socket.io');








exports.updateissue = function updateissue (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var issueid = request.params.issueid;


    var changesinissue = request.body;


    var fieldchange = changesinissue.field;
    var fieldnewvalue = changesinissue.fieldnewvalue;
    var fieldoldvalue = changesinissue.fieldoldvalue;



    if(userid == undefined || userid == null || userid == "undefined" || userid == "null" || userid == '' ||
        channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
        groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ||
        issueid == undefined || issueid == null || issueid == "undefined" || issueid == "null" || issueid == '' ){



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
                                /* hacemos search de issue para comprobar que el id de canal coincide  */

                                var query = { channel: channelid, _id: issueid};



                                /* aqui tengo el userstory entero, puedo coger el valor de la tarea, lo que valia antes
                                 * tendria que recorrerlo buscando la tarea pero me vale */
                                issueservice.getissueByIdwithquery (query).then(function (error, issueresult) {
                                    if (error) {
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {

                                        if(issueresult == undefined || issueresult == null || issueresult == ''){
                                            var err = {
                                                code: 402,
                                                message: "The issue to update not found inside channel requested."
                                            };
                                            response.status(err.code).json({message: err.message});

                                        }
                                        else {

                                            /* ha encontrado el issue en el canal */
                                            /* luego parseamos los fields */
                                            /* tenemos el issue entero anterior */


                                            /* fieldchange fieldnewvalue issueresult */
                                            /* miramos que fieldchange fieldnewvalue no sea vacio */

                                            if((fieldchange == null || fieldchange == undefined || fieldchange == '' ||
                                                fieldnewvalue == null || fieldnewvalue == undefined || fieldnewvalue == '')
                                                && (fieldchange !== 'voters')
                                                && (fieldchange !== 'userstories')){

                                                response.status(400).json({message: 'Bad Request. Missing required parameters: fieldchange or fieldnewvalue.'});



                                            }
                                            else{

                                                var answer = issueErrors.checkfields(fieldnewvalue, fieldchange, fieldoldvalue);

                                                if(answer.num == 0){
                                                    /* hay error */
                                                    response.status(answer.err.code).json({message: answer.err.message });
                                                }
                                                else {

                                                    /* num == 1 assignedto */
                                                    /* buscamos que el user ste en el channel */
                                                    if(answer.num == 1) {

                                                        chatErrors.checkuserinchannel(channelid,fieldnewvalue)
                                                            .then (function (error,channel) {
                                                                if (error) {
                                                                    response.status(401).json({message: 'User assignee not included in requested channel'});
                                                                }
                                                                else {

                                                                    issueservice.updateissue (issueid, answer.num, fieldnewvalue).then(function (error, newissueresult) {
                                                                        if (error) {
                                                                            response.status(error.code).json({message: error.message});
                                                                        }
                                                                        else {

                                                                            /* notificamos al CH de que ha cambiado el userstory */
                                                                            socketio.getIO().sockets.to('CH_' + channelid).emit('updateIssue', {issue: newissueresult});



                                                                            var messagetext = createJSONmsgTask.generateMSGupdateIssue(answer.num, result, fieldoldvalue,
                                                                                fieldchange, newissueresult, fieldnewvalue, null);



                                                                            messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {
                                                                                response.json(newissueresult);

                                                                            });






                                                                        } /* else !error*/
                                                                    }); /* end update task */



                                                                }

                                                            }); /* end of checkuserinchannel assignee */
                                                    }/* end if num == 1 */
                                                    /* luego igual se puede generalizar */

                                                    /* promote userstory:: issueresult aqui tenemos el objecto real */
                                                    else if(answer.num == 13){
                                                        /* 1:: crear 1 US
                                                        * 2:: updatear la issue con ese id
                                                        * 3 generar un comentario con el sender */


                                                        var userstory = {};
                                                        userstory.subject = issueresult.subject;
                                                        userstory.datetime = new Date();
                                                        userstory.channel = channelid;
                                                        userstory.createdby = userid;

                                                        userstoryservice.newuserstory (userstory).then(function (error, userstoryresult) {
                                                            if (error) {
                                                                response.status(error.code).json({message: error.message});
                                                            } else {

                                                                console.log("userstory successfully created... ");

                                                                /* notif. al CH de nuevo userstory */
                                                                /*socketio.getIO().sockets.to('CH_' + channelid).emit('newUserstory', {groupid: groupid, userstory: userstory});*/
                                                                socketio.getIO().sockets.to('CH_' + channelid).emit('newUserstory', {userstory: userstoryresult});


                                                                /* ahora updateamos la issue */

                                                                fieldnewvalue = userstoryresult.id;

                                                                issueservice.updateissue(issueid, answer.num, fieldnewvalue).then(function (error, newissueresult) {
                                                                    if (error) {
                                                                        response.status(error.code).json({message: error.message});
                                                                    }
                                                                    else {

                                                                        /* notificamos al CH de que ha cambiado el userstory ******************/
                                                                        socketio.getIO().sockets.to('CH_' + channelid).emit('updateIssue', {issue: newissueresult});


                                                                        /* ahora generamos el mensaje, no comment xq no esta preparado */
                                                                        messageservice.newinternalcomment(result, newissueresult, userstoryresult, channelid).then(function (error, comment) {


                                                                            messageservice.newinternalmessage(comment, channelid).then(function (error, message) {
                                                                                response.json(newissueresult);

                                                                            });
                                                                        });



                                                                    }
                                                                    /* else !error*/
                                                                });




                                                            } /* end else !err */
                                                        }); /* method newuserstory */




                                                    }

                                                    /* de momento 2:: unassigned y 12 voters */
                                                    else {


                                                        /* tengo el issueresult que es lo que valia antes */


                                                        if (answer.num == 4) {
                                                            /* creamos el objecto del commentario */
                                                            var comment = {};
                                                            comment.created = new Date();
                                                            comment._user = userid;
                                                            comment.comment = fieldnewvalue;
                                                            fieldnewvalue = comment;

                                                        }


                                                        issueservice.updateissue(issueid, answer.num, fieldnewvalue).then(function (error, newissueresult) {
                                                            if (error) {
                                                                response.status(error.code).json({message: error.message});
                                                            }
                                                            else {

                                                                /* notificamos al CH de que ha cambiado el userstory ******************/
                                                                socketio.getIO().sockets.to('CH_' + channelid).emit('updateIssue', {issue: newissueresult});


                                                                if (answer.num !== 5) {
                                                                    /* tengo que hacer 1 json para el mensaje */
                                                                    var messagetext = createJSONmsgTask.generateMSGupdateIssue(answer.num, result, fieldoldvalue,
                                                                        fieldchange, newissueresult, fieldnewvalue, issueresult);


                                                                    messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {
                                                                        response.json(newissueresult);

                                                                    });

                                                                }
                                                                else {
                                                                    response.json(newissueresult);

                                                                }


                                                            }
                                                            /* else !error*/
                                                        });
                                                        /* end update issue */


                                                    }

                                                } /* end else answer.num == 0 */

                                            } /* end else fieldchange == null || fieldnewvalue == null */
                                        } /* end else userstoryresult == undefined */

                                    } /* end else !err */
                                }); /* end method getUserstoryByIdwithquery */


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
/**************************** end update issue *************************************************/





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









exports.deleteissue = function deleteissue (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var issueid = request.params.issueid;




    if(userid == undefined || userid == null || userid == "undefined" || userid == "null" ||userid == '' ||
        channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
        groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ||
        issueid == undefined || issueid == null || issueid == "undefined" || issueid == "null" || issueid == ''){


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

                                var query = { channel: channelid, _id: issueid};

                                issueservice.getissueByIdwithquery (query).then(function (error, issueresult) {
                                    if (error) {
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {

                                        console.log("esto vale issueresult************************");
                                        console.log(issueresult);
                                        if(issueresult == undefined || issueresult == null || issueresult == ''){
                                            var err = {
                                                code: 402,
                                                message: "The issue to update not found inside channel requested."
                                            };
                                            response.status(err.code).json({message: err.message});

                                        }
                                        else {

                                            /* ha encontrado el issue en el canal */
                                            /* luego parseamos los fields */
                                            /* tenemos el issue entero anterior */



                                            /* esto retorna el US de nuevo */

                                            issueservice.deleteissueById (issueid)
                                                .then(function (error, issueresultid) {
                                                    if (error) {

                                                        response.status(error.code).json({message: error.message});
                                                    }

                                                    else {


                                                        socketio.getIO().sockets.to('CH_' + channelid).emit('deleteIssue', {issueid: issueid});


                                                        /* tengo que hacer 1 json para el mensaje **********************/
                                                        var messagetext = createJSONmsgTask.generateMSGDeleteIssue(result, issueresult);


                                                        messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                            response.json({
                                                                issueid: issueid,
                                                                message: 'Issue deleted successfully'
                                                            });


                                                        });



                                                    }
                                                });


                                        }


                                    }



                                }); /* end method getissuebyid para saber que existe en el canal */


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
