/**
 * Created by izaskun on 2/06/16.
 */



'use strict';



var Auth  = require('../helpers/authentication');

var channelservice  = require('../services/channel');
var userstoryservice  = require('../services/userstory');
var taskservice = require('../services/task');
var messageservice  = require('../services/message');


var chatErrors  = require('../helpers/chatErrorsHandler');
var userstoryErrors  = require('../helpers/userstoryErrorsHandler');

var taskErrors = require('../helpers/taskErrorsHandler');

var createJSONmsgTask  = require('../helpers/createJSONmsgTask');

var socketio  = require('../helpers/sockets');
var io = require('socket.io');






exports.deletetask = function deletetask (request, response){
    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var userstoryid = request.params.userstoryid;
    var taskid = request.params.taskid;

    /* devolvemos el id de la tarea */

    if(userid == undefined || userid == null || userid == "undefined" || userid == "null" || userid == '' ||
        channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
        groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ||
        userstoryid == undefined || userstoryid == null || userstoryid == "undefined" || userstoryid == "null" || userstoryid == '' ||
        taskid == undefined || taskid == null || taskid == "undefined" || taskid == "null" || taskid == ''){


        response.status(400).json({message: 'Bad Request. Missing required parameters in URL.'});

    }
    else{


        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
            }
            else {
                if (userid == result._id) {

                    chatErrors.checkuserinchannel(channelid,userid)
                        .then (function (error,channel) {
                            if (error) {
                                response.status(401).json({message: 'User not included in requested channel'});
                            }
                            else {


                                var query = {channel: channelid, _id: userstoryid, tasks: taskid};

                                userstoryservice.getuserstoryByIdwithquery(query).then(function (error, userstoryresult) {
                                    if (error) {
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {

                                        if (userstoryresult == undefined || userstoryresult == null || userstoryresult == '') {
                                            var err = {
                                                code: 402,
                                                message: "The task to remove not found inside channel requested."
                                            };
                                            response.status(err.code).json({message: err.message});

                                        }
                                        else {



                                            /* hay que borrar la task del userstory */

                                            userstoryservice.deletetaskFromUS(userstoryid, taskid).then(function (error, usresult) {
                                                if (error) {
                                                    response.status(error.code).json({message: error.message});
                                                }
                                                else {

                                                    taskservice.deletetask(taskid).then(function (error, taskresult) {
                                                        if (error) {
                                                            response.status(error.code).json({message: error.message});
                                                        }
                                                        else {




                                                            /* notificamos al CH de que ha cambiado el userstory */
                                                            socketio.getIO().sockets.to('CH_' + channelid).emit('deleteTask', {
                                                                taskid: taskid,
                                                                userstoryid: userstoryid
                                                            });


                                                            /* tengo que hacer 1 json para el mensaje */
                                                            var messagetext = createJSONmsgTask.generateMSGRemoveTask(result, userstoryresult, taskresult);


                                                            messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {
                                                                response.json({ taskid: taskresult.id, message: 'Task deleted successfully'});

                                                            });

                                                        }
                                                    });
                                                    /* end delete task */


                                                }
                                            }); /* end method deletetaskfromUS */



                                        }
                                        /* end else not userstory */

                                    }
                                    /* end else !error */

                                });
                                /* end method userstory.service para coger el US */
                            }
                        }); /* checkuser in channel */

                }     /* end userid = result.id */
                else {
                    response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
                }
            }
        });

    }





};


exports.newtask = function newtask (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var userstoryid = request.params.userstoryid;
    var task = request.body;

    console.log("esto vale userstoryid al crear 1 tarea");
    console.log(userstoryid);


    if(task == undefined || task == null || task == '' ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: task.'});

    }
    else {

        /* cuando creamos 1 tarea la metemos en la bd y la introducimos en el userstory */
        /* tasks       : [{ type: Schema.ObjectId, ref: 'Task', required: false }],*/

        task.datetime = new Date();
        task.createdby = userid;




        if(task.subject == undefined || task.subject == null || task.subject == ''){
            response.status(400).json({message: 'Bad Request. Missing required parameters: subject.'});

        }
        else {

            if(userid == undefined || userid == null || userid == "undefined" || userid == "null" || userid == '' ||
                channelid == undefined || channelid == null || channelid == "undefined" || channelid == null || channelid == '' ||
                groupid == undefined || groupid == null || groupid == "undefined" || groupid == null || groupid == '' ||
                userstoryid == undefined || userstoryid == null || userstoryid == "undefined" || userstoryid == null || userstoryid == '' ){


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

                                        /* creamos la tarea para tener el id */
                                        /* hacemos search de userstory y comprobar que el id de canal coincide  */

                                        /* devuelve objeto */
                                        /* si no lo encuentra me da error */
                                        userstoryservice.getuserstoryById (channelid, userstoryid).then(function (error, userstoryresult) {
                                            if (error) {
                                                response.status(error.code).json({message: error.message});
                                            } else {

                                                if(userstoryresult == undefined || userstoryresult == null || userstoryresult == ''){
                                                    var err = {
                                                        code: 402,
                                                        message: "Userstory to add task not found inside channel requested."
                                                    };
                                                    response.status(err.code).json({message: err.message});

                                                }
                                                else {

                                                    /* ha encontrado al userstory en el canal y podemos añadir tarea y metersela */
                                                    /* con el id nos vale */

                                                    /*console.log("esto vale el userstoryresult para ver si existe el userstory en el canal, lo queremos asi para el status");
                                                    console.log(userstoryresult.status);*/

                                                    /* si hacemos parse tenemos su status?? */

                                                    taskservice.newtask (task).then(function (error, taskresult) {
                                                        if (error) {
                                                            response.status(error.code).json({message: error.message});
                                                        } else {

                                                            console.log("esto me devuelve taskresult");
                                                            console.log(taskresult);

                                                            /* una vez creada la tarea actualizamos el userstory */

                                                            userstoryservice.updateuserstoryTaskById (userstoryid, taskresult.id ).then(function (error, userstoryresultchanged) {
                                                                if (error) {

                                                                    response.status(error.code).json({message: error.message});
                                                                } else {

                                                                    /* tenemos el userstory integro, hacemos lo mismo que antes, mandamos xsocket el nuevo userstory
                                                                    * y que lo actualize, mirar si funciona en angular al meter 1 userstory nuevo que se actualiza la tabla
                                                                     * con tasks */




                                                                    /*console.log("userstory successfully update with task... ");
                                                                    console.log("este es el userstoryresultchanged que devuelve el metodo de updateuserstoryTaskById");
                                                                    console.log(userstoryresultchanged);*/


                                                                    /* notificamos al CH de que ha cambiado el userstory */
                                                                    socketio.getIO().sockets.to('CH_' + channelid).emit('updateUserstory', {userstory: userstoryresultchanged});


                                                                    /* tengo que hacer 1 json para el mensaje */

                                                                    var messagetext = createJSONmsgTask.generateMSGnew(result, userstoryresultchanged, taskresult);


                                                                    messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                        /* metemos aqui el nuevo message de status */
                                                                        /* si ha cambiado el status field       :   10,
                                                                        * y action updated
                                                                         * y event userstory
                                                                        * messagetext.codepoints = codepoints; tendria primero el status de antes(from)
                                                                         * y luego el nuevo (to)
                                                                        * para este mensaje necesitamos la tarea (id, subject y num) y del userstory (id, num, y subject)
                                                                        * */


                                                                        /* si son !== enviamos el mensaje */

                                                                        console.log("en crear tarea esto valen los estatus de los userstories antes y despues de meterla");
                                                                        console.log("userstoryresultchanged.status");
                                                                        console.log(userstoryresultchanged.status);
                                                                        console.log("userstoryresult.status");
                                                                        console.log(userstoryresult.status);
                                                                        if(userstoryresultchanged.status !== userstoryresult.status){



                                                                            var messagetext2 = createJSONmsgTask.generateMSGnewStatusChange(userstoryresultchanged, userstoryresult, taskresult);


                                                                            messageservice.newinternalmessage(messagetext2, channelid).then(function (error, message) {
                                                                                response.json(userstoryresultchanged);

                                                                            });



                                                                        }
                                                                        else{
                                                                            response.json(userstoryresultchanged);


                                                                        }




                                                                    });

                                                                    /* si el status del userstory ha cambiado hay que hacer otro mensaje o poner que ha producido cambio
                                                                    * en el status del userstory */



                                                                }
                                                            }); /* end method updateuserstoryTaskById */





                                                        }
                                                    }); /* end method newtask */







                                                } /* ha encontrado al userstory en el canal y podemos añadir tarea y metersela */



                                            }
                                        }); /* end method getUserstoryById */







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



























exports.updatetask = function updatetask (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var userstoryid = request.params.userstoryid;
    var taskid = request.params.taskid;


    var changesintask = request.body;


    var fieldchange = changesintask.field;
    var fieldnewvalue = changesintask.fieldnewvalue;
    var fieldoldvalue = changesintask.fieldoldvalue;



    if(userid == undefined || userid == null || userid == "undefined" || userid == "null" || userid == '' ||
        channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
        groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ||
        userstoryid == undefined || userstoryid == null || userstoryid == "undefined" || userstoryid == "null" || userstoryid == '' ||
        taskid == undefined || taskid == null || taskid == "undefined" || taskid == "null" || taskid == ''){



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
                                /* hacemos search de userstory y comprobar que el id de canal coincide  */

                                var query = { channel: channelid, _id:userstoryid, tasks:taskid};



                                /* aqui tengo el userstory entero, puedo coger el valor de la tarea, lo que valia antes
                                * tendria que recorrerlo buscando la tarea pero me vale */
                                userstoryservice.getuserstoryByIdwithquery (query).then(function (error, userstoryresult) {
                                    if (error) {
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {

                                        if(userstoryresult == undefined || userstoryresult == null || userstoryresult == ''){
                                            var err = {
                                                code: 402,
                                                message: "The task to update not found inside channel requested."
                                            };
                                            response.status(err.code).json({message: err.message});

                                        }
                                        else {

                                            /* ha encontrado al userstory en el canal */
                                            /* luego parseamos los fields */
                                            /* tenemos el userstory entero y la tarea */


                                            /* fieldchange fieldnewvalue task userstoryresult */
                                            /* miramos que fieldchange fieldnewvalue no sea vacio */
                                            /* falta task pero realmente no debería obligar a que mande toda la tarea, no tiene sentido */

                                            if(fieldchange == null || fieldchange == undefined || fieldchange == '' ||
                                                fieldnewvalue == null || fieldnewvalue == undefined || fieldnewvalue == '' ){

                                                response.status(400).json({message: 'Bad Request. Missing required parameters: fieldchange or fieldnewvalue.'});



                                            }
                                            else{

                                                var answer = taskErrors.checkfields(fieldnewvalue, fieldchange, fieldoldvalue);

                                                if(answer.num == 0){
                                                    /* hay error */
                                                    response.status(answer.err.code).json({message: answer.err.message });
                                                }
                                                else {

                                                    /* vamos ha hacerlo para num == 1 assignedto */
                                                    /* buscamos que el user ste en el channel */
                                                    if(answer.num == 1 || answer.num == 2) {

                                                        chatErrors.checkuserinchannel(channelid,fieldnewvalue)
                                                            .then (function (error,channel) {
                                                                if (error) {
                                                                    response.status(401).json({message: 'User assignee not included in requested channel'});
                                                                }
                                                                else {



                                                                    /* aqui tenemos el old vale , si es undefined ponemos not assignet */

                                                                            /* aqui tenemos el valor de task.assignedto anterior con todos los campos */
                                                                            /* ahora updateamos */
                                                                    /* aqui tengo que mirar si answer.num == 2 el assignee de la tarea y su []
                                                                    *
                                                                    * tengo userstoryresult que tiene a la tarea
                                                                    *
                                                                    * */


                                                                    /* esto lo puedo hacer en el helper */


                                                                    var isworker = false;
                                                                    if(answer.num == 2){

                                                                        /* nos recorremos userstoryresult */
                                                                        isworker = taskErrors.checkisassignedorcontributor(userstoryresult, taskid, fieldnewvalue);

                                                                    }
                                                                    if(answer.num == 1){
                                                                        isworker = taskErrors.checkiscontributor(userstoryresult, taskid, fieldnewvalue);

                                                                    }

                                                                    if(!isworker){
                                                                        taskservice.updatetask (taskid, answer.num, fieldnewvalue).then(function (error, newtaskresult) {
                                                                            if (error) {
                                                                                response.status(error.code).json({message: error.message});
                                                                            }
                                                                            else {

                                                                                /* notificamos al CH de que ha cambiado el userstory */
                                                                                socketio.getIO().sockets.to('CH_' + channelid).emit('updateTask', {task: newtaskresult, userstoryid: userstoryid});


                                                                                /* tengo que hacer 1 json para el mensaje, este siempre es el mismo  */
                                                                                var messagetext = createJSONmsgTask.generateMSGupdateTask(answer.num, result, fieldoldvalue, fieldchange, newtaskresult, userstoryresult, fieldnewvalue);

                                                                                /*console.log("en controller esto vale message");
                                                                                console.log(messagetext);*/


                                                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {
                                                                                    response.json(newtaskresult);

                                                                                });


                                                                            } /* else !error*/
                                                                        }); /* end update task */

                                                                    }
                                                                    else{
                                                                        if(answer.num == 1){
                                                                            response.status(403).json({message: 'Bad Request. The member to add as assignee is already as contributor.'});


                                                                        }
                                                                        else{
                                                                            response.status(403).json({message: 'Bad Request. The member to add as contributor is already in.'});


                                                                        }


                                                                    }







                                                                }

                                                            }); /* end of checkuserinchannel assignee */
                                                    }/* end if num == 0 */
                                                    /* luego igual se puede generalizar */




                                                    /***************    empezamossssssssssssss ********************/


                                                    else {

                                                        if(answer.num == 4){
                                                            /* creamos el objecto del commentario */
                                                            var comment = {};
                                                            comment.created = new Date();
                                                            comment._user = userid;
                                                            comment.comment = fieldnewvalue;
                                                            fieldnewvalue = comment;

                                                        }

                                                        taskservice.updatetask (taskid, answer.num, fieldnewvalue).then(function (error, newtaskresult) {
                                                            if (error) {
                                                                response.status(error.code).json({message: error.message});
                                                            }
                                                            else {

                                                                /* notificamos al CH de que ha cambiado el userstory */
                                                                socketio.getIO().sockets.to('CH_' + channelid).emit('updateTask', {task: newtaskresult, userstoryid: userstoryid});



                                                                /* cuando borramos comentario no hacemos mensaje */
                                                                if (answer.num !== 11) {
                                                                    /* tengo que hacer 1 json para el mensaje */
                                                                    var messagetext = createJSONmsgTask.generateMSGupdateTask(answer.num, result, fieldoldvalue, fieldchange, newtaskresult, userstoryresult, fieldnewvalue);


                                                                    messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {
                                                                        response.json(newtaskresult);

                                                                    });

                                                                }
                                                                else{
                                                                    response.json(newtaskresult);

                                                                }







                                                            } /* else !error*/
                                                        }); /* end update task */




                                                    } /*end if num == 7 */




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

















