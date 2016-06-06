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

var socketio  = require('../helpers/sockets');
var io = require('socket.io');




exports.newtask = function newtask (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var userstoryid = request.params.userstoryid;


    var task = request.body;


    console.log("esto vale task");
     console.log(task);


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

            if(userid == undefined || userid == null || userid == '' ||
                channelid == undefined || channelid == null || channelid == '' ||
                groupid == undefined || groupid == null || groupid == '' ||
                userstoryid == undefined || userstoryid == null || userstoryid == '' ){


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

                                                    console.log("esto vale el userstoryresult para ver si existe el userstory en el canal, lo queremos asi para el status");
                                                    console.log(userstoryresult.status);

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




                                                                    console.log("userstory successfully update with task... ");
                                                                    console.log("este es el userstoryresultchanged que devuelve el metodo de updateuserstoryTaskById");
                                                                    console.log(userstoryresultchanged);


                                                                    /* notificamos al CH de que ha cambiado el userstory */
                                                                    socketio.getIO().sockets.to('CH_' + channelid).emit('updateUserstory', {userstory: userstoryresultchanged});


                                                                    /* tengo que hacer 1 json para el mensaje */

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
                                                                        event       :  'task',
                                                                        sender      :   sender

                                                                    };

                                                                    /* hay que meter la tarea x separado para que se sepa cual se ha añadido */

                                                                    messagetext.userstory = {
                                                                        id          : userstoryresultchanged.id,
                                                                        num         : userstoryresultchanged.num,
                                                                        subject     : userstoryresultchanged.subject
                                                                    };


                                                                    /* si el status del userstory ha cambiado hay que notificarlo */
                                                                    messagetext.task = {
                                                                        id          : taskresult.id,
                                                                        num         : taskresult.num,
                                                                        subject     : taskresult.subject,
                                                                        status      : taskresult.status,
                                                                        description : taskresult.description,
                                                                        requirement : taskresult.requirement

                                                                    };


                                                                    console.log("esto vale el userstory que voy a meter en mensaje text en controller/userstory para la creacion de nueva tarea");
                                                                    console.log(messagetext.userstory);

                                                                    console.log("esto vale la tarea que voy a meter en mensaje text en controller/userstory para la creacion de nueva tarea");
                                                                    console.log(messagetext.task);


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
                                                                        if(userstoryresultchanged.status !== userstoryresult.status){

                                                                            var messagetext2 = {
                                                                                action      : 'updated',
                                                                                event       :  'userstory',
                                                                                field       :   10

                                                                            };

                                                                            var codepoints = {
                                                                                from    : userstoryresult.status,
                                                                                to      : userstoryresultchanged.status

                                                                            };


                                                                            messagetext2.codepoints = codepoints;




                                                                            /* hay que meter la tarea x separado para que se sepa cual se ha añadido */

                                                                            messagetext2.userstory = {
                                                                                id          : userstoryresultchanged.id,
                                                                                num         : userstoryresultchanged.num,
                                                                                subject     : userstoryresultchanged.subject
                                                                            };


                                                                            /* si el status del userstory ha cambiado hay que notificarlo */
                                                                            messagetext2.task = {
                                                                                id          : taskresult.id,
                                                                                num         : taskresult.num,
                                                                                subject     : taskresult.subject
                                                                            };


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


    console.log("esto vale changeintask");
    console.log(changesintask);


    var fieldchange = changesintask.field;
    var fieldnewvalue = changesintask.fieldnewvalue;


    var fieldoldvalue = changesintask.fieldoldvalue;

    console.log("esto vale oldvalue");

    console.log(fieldoldvalue);



    if(taskid == undefined || taskid == null || taskid == '' ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: task id.'});

    }
    else {

        if(userid == undefined || userid == null || userid == '' ||
            channelid == undefined || channelid == null || channelid == '' ||
            groupid == undefined || groupid == null || groupid == '' ||
            userstoryid == undefined || userstoryid == null || userstoryid == '' ||
            taskid == undefined || taskid == null || taskid == ''){


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

                                    userstoryservice.getuserstoryByIdwithquery (query).then(function (error, userstoryresult) {
                                        if (error) {
                                            response.status(error.code).json({message: error.message});
                                        }
                                        else {

                                            if(userstoryresult == undefined || userstoryresult == null || userstoryresult == ''){
                                                var err = {
                                                    code: 402,
                                                    message: "The task to add not found inside channel requested."
                                                };
                                                response.status(err.code).json({message: err.message});

                                            }
                                            else {

                                                /* ha encontrado al userstory en el canal */
                                                /* luego parseamos los fields */
                                                /* tenemos el userstory entero y la tarea */


                                                console.log("esto vale el userstoryresult para ver si existe el userstory en el canal, lo queremos asi para el status");
                                                console.log(userstoryresult.status);


                                                /* fieldchange fieldnewvalue task userstoryresult */
                                                /* miramos que fieldchange fieldnewvalue no sea vacio */
                                                /* falta task pero realmente no debería obligar a que mande toda la tarea, no tiene sentido */

                                                if(fieldchange == null || fieldchange == undefined || fieldchange == '' ||
                                                    fieldnewvalue == null || fieldnewvalue == undefined || fieldnewvalue == '' ){

                                                    response.status(400).json({message: 'Bad Request. Missing required parameters: fieldchange or fieldnewvalue.'});



                                                }
                                                else{

                                                    var answer = taskErrors.checkfields(fieldnewvalue, fieldchange);

                                                    if(answer.num == 0){
                                                        /* hay error */
                                                        response.status(answer.err.code).json({message: answer.err.message });
                                                    }
                                                    else {

                                                        /* vamos ha hacerlo para num == 1 assignedto */
                                                        /* buscamos que el user ste en el channel */
                                                        if(answer.num == 1) {
                                                            chatErrors.checkuserinchannel(channelid,fieldnewvalue)
                                                                .then (function (error,channel) {
                                                                    if (error) {
                                                                        response.status(401).json({message: 'User assignee not included in requested channel'});
                                                                    }
                                                                    else {



                                                                        /* aqui tenemos el old vale , si es undefined ponemos not assignet */

                                                                                /* aqui tenemos el valor de task.assignedto anterior con todos los campos */
                                                                                /* ahora updateamos */


                                                                        taskservice.updatetask (taskid, answer.num, fieldnewvalue).then(function (error, newtaskresult) {
                                                                            if (error) {
                                                                                response.status(error.code).json({message: error.message});
                                                                            }
                                                                            else {

                                                                                /* notificamos al CH de que ha cambiado el userstory */
                                                                                socketio.getIO().sockets.to('CH_' + channelid).emit('updateTask', {task: newtaskresult, userstoryid: userstoryid});


                                                                                /* tengo que hacer 1 json para el mensaje */

                                                                                var sender = {
                                                                                    id  : result._id,
                                                                                    username: result.username,
                                                                                    mail: result.mail
                                                                                };


                                                                                if(fieldoldvalue == undefined ||
                                                                                    fieldoldvalue == null ||
                                                                                    fieldoldvalue == ''){
                                                                                    fieldoldvalue = {};
                                                                                    fieldoldvalue.username = "None";

                                                                                }
                                                                                else if(fieldoldvalue.username == undefined ||
                                                                                    fieldoldvalue.username == null ||
                                                                                    fieldoldvalue.username == ''){
                                                                                    fieldoldvalue.username = "None";

                                                                                }

                                                                                var attr = {
                                                                                    'fieldchange' : fieldchange,
                                                                                    'newfield'    : newtaskresult.assignedto,
                                                                                    'oldfield'    : fieldoldvalue
                                                                                };

                                                                                var messagetext = {
                                                                                    action      : 'updated',
                                                                                    event       :  'task',
                                                                                    sender      :  sender,
                                                                                    attr        :  attr
                                                                                };

                                                                                /* hay que meter la tarea x separado para que se sepa cual se ha añadido */

                                                                                messagetext.userstory = {
                                                                                    id          : userstoryresult.id,
                                                                                    num         : userstoryresult.num,
                                                                                    subject     : userstoryresult.subject
                                                                                };


                                                                                /* si el status del userstory ha cambiado hay que notificarlo */
                                                                                messagetext.task = {
                                                                                    id          : newtaskresult.id,
                                                                                    num         : newtaskresult.num,
                                                                                    subject     : newtaskresult.subject,
                                                                                    status      : newtaskresult.status,
                                                                                    description : newtaskresult.description,
                                                                                    requirement : newtaskresult.requirement

                                                                                };


                                                                                /*console.log("esto vale el userstory que voy a meter en mensaje text en controller/userstory para la creacion de nueva tarea");
                                                                                console.log(messagetext.userstory);

                                                                                console.log("esto vale la tarea que voy a meter en mensaje text en controller/userstory para la creacion de nueva tarea");
                                                                                console.log(messagetext.task);*/
                                                                                console.log("esto vale oldvalue");


                                                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {
                                                                                    response.json(newtaskresult);

                                                                                });


                                                                            } /* else !error*/
                                                                        }); /* end update task */



                                                                    }

                                                                }); /* end of checkuserinchannel assignee */
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


    } /* end else userstory == undefined */


};

















