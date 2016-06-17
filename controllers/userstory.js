/**
 * Created by izaskun on 25/05/16.
 */

'use strict';



var Auth  = require('../helpers/authentication');

var channelservice  = require('../services/channel');
var userstoryservice  = require('../services/userstory');
var messageservice  = require('../services/message');
var sprintservice  = require('../services/sprint');


var chatErrors  = require('../helpers/chatErrorsHandler');
var userstoryErrors  = require('../helpers/userstoryErrorsHandler');

var socketio  = require('../helpers/sockets');
var io = require('socket.io');



async = require("async");


var createJSONmsgTask  = require('../helpers/createJSONmsgTask');




exports.newuserstory = function newuserstory (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;


    var userstory = request.body;


    if(userstory == undefined || userstory == null || userstory == '' ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: userstory.'});

    }
    else {


        if(userstory.subject == undefined || userstory.subject == null || userstory.subject == ''){
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
                                        /* entonces procedemos a guardar el userstory */

                                        userstory.datetime = new Date();
                                        userstory.channel = channelid;
                                        userstory.createdby = userid;

                                        console.log("esto vale sprint");
                                        console.log(userstory.sprint);


                                        /* antes de meterlo, mirar si tiene sprint */
                                        if(userstory.sprint !== undefined &&
                                            userstory.sprint !== null &&
                                            userstory.sprint !== '' ) {

                                            /* lo buscamos el la bd, mirar el canal y el id */
                                            sprintservice.checksprintexistsByIdCH(channelid, userstory.sprint).then(function (error, sprintresult) {
                                                if (error) {
                                                    response.status(error.code).json({message: error.message});
                                                }
                                                else {

                                                    console.log("esto vale sprint result");
                                                    console.log(sprintresult);


                                                    if(sprintresult == undefined ||
                                                        sprintresult == null ||
                                                        sprintresult == ''){
                                                        response.status(400).json({message: 'Bad Request. Sprint parameter does not exist or does not belong to this channel.'});



                                                    }
                                                    else{
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
                                                                var messagetext = createJSONmsgTask.generateMSGNewUS(result, userstoryresult, sprintresult);



                                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                    /* devuelvo el json cuando se haya hecho all */
                                                                    response.json(userstoryresult);

                                                                });


                                                            } /* end else !err */
                                                        }); /* method newuserstory */


                                                    }


                                                } /* ! err buscando sprint */


                                            });

                                        } /* se ha mandado con sprint sprint  */
                                        /* no se ha mandado sprint */
                                        else {

                                            userstoryservice.newuserstory (userstory).then(function (error, userstoryresult) {
                                                if (error) {
                                                    response.status(error.code).json({message: error.message});
                                                } else {

                                                    console.log("userstory successfully created... ");

                                                    /* notif. al CH de nuevo userstory */
                                                    /*socketio.getIO().sockets.to('CH_' + channelid).emit('newUserstory', {groupid: groupid, userstory: userstory});*/
                                                    socketio.getIO().sockets.to('CH_' + channelid).emit('newUserstory', {userstory: userstoryresult});


                                                    /* tengo que hacer 1 json para el mensaje */
                                                    var messagetext = createJSONmsgTask.generateMSGNewUS(result, userstoryresult, null);



                                                    messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                        /* devuelvo el json cuando se haya hecho all */
                                                        response.json(userstoryresult);

                                                    });


                                                } /* end else !err */
                                            }); /* method newuserstory */

                                        }




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

/* aqui habria que mirar que el userstory esta en el canal, falta, asique cambiamos y probamos */
exports.updateuserstory = function updateuserstory (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var userstoryid = request.params.userstoryid;


    var changesinuserstory = request.body;

    var userstory = changesinuserstory.userstory;
    var fieldchange = changesinuserstory.field;
    var codepoints = changesinuserstory.codepoints;



    if((userstory == undefined || userstory == null || userstory == '') && (fieldchange !== 'unsprint') ){
        response.status(400).json({message: 'Bad Request. Missing required parameters: userstory.'});
    }
    else {
        if(fieldchange == undefined || fieldchange == null || fieldchange == ''){
            response.status(400).json({message: 'Bad Request. Missing required parameters: field that changed.'});
        }
        else {
            if(userid == undefined || userid == null || userid == "undefined" || userid == "null" ||userid == '' ||
                channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
                groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ||
                userstoryid == undefined || userstoryid == null || userstoryid == "undefined" || userstoryid == "null" || userstoryid == '' ){
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


                                            /* miramos que exista el US dentro del canal, porque puede existir pero no es propietario */
                                            userstoryservice.getuserstoryById (channelid, userstoryid).then(function (error, userstoryexists) {
                                                if (error) {
                                                    response.status(error.code).json({message: error.message});
                                                } else {

                                                    if (userstoryexists == undefined || userstoryexists == null || userstoryexists == '') {
                                                        var err = {
                                                            code: 402,
                                                            message: "Userstory to update not found inside channel requested."
                                                        };
                                                        response.status(err.code).json({message: err.message});

                                                    }
                                                    else {


                                                        /* antes de updatear hay que mirar que el sprint pertenezca al canal */
                                                        if(codefield == 9){

                                                            sprintservice.checksprintexistsByIdCH(channelid, userstory.sprint).then(function (error, sprintresult) {
                                                                if (error) {
                                                                    response.status(error.code).json({message: error.message});
                                                                }
                                                                else {

                                                                    console.log("************ esto vale sprint result ******************");
                                                                    console.log(sprintresult);


                                                                    if (sprintresult == undefined ||
                                                                        sprintresult == null ||
                                                                        sprintresult == '') {
                                                                        response.status(400).json({message: 'Bad Request. Sprint parameter does not exist or does not belong to this channel.'});


                                                                    }
                                                                    else {
                                                                        /* aqui tengo el objeto sprint */


                                                                        userstoryservice.updateuserstoryById (userstoryid, userstory, codefield).then(function (error, userstoryresult) {
                                                                            if (error) {
                                                                                response.status(error.code).json({message: error.message});
                                                                            } else {

                                                                                socketio.getIO().sockets.to('CH_' + channelid).emit('updateUserstory', {userstory: userstoryresult});

                                                                                /* antes de realizar el mensaje buscamos el anterior sprint */

                                                                                console.log("***********************esto vale userstoryexist.sprint****************");
                                                                                console.log(userstoryexists.sprint);


                                                                                /* aunque antes no tuviera sprint ahora si */
                                                                                codepoints = {};
                                                                                codepoints.new = sprintresult;



                                                                                if(userstoryexists.sprint !== undefined &&
                                                                                    userstoryexists.sprint !== null &&
                                                                                    userstoryexists.sprint !== '' ){

                                                                                    console.log("el userstory de antes tiene sprint ya asignado");



                                                                                    sprintservice.checksprintexistsByIdCH(channelid, userstoryexists.sprint).then(function (error, sprintresultold) {
                                                                                        if (!error &&
                                                                                            sprintresultold !== undefined &&
                                                                                            sprintresultold !== null &&
                                                                                            sprintresultold !== '') {


                                                                                            codepoints.old = sprintresultold;
                                                                                            var messagetext = createJSONmsgTask.generateMSGUpdateUS(result, userstoryresult, codefield, codepoints);



                                                                                            messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                                                /* devuelvo el json cuando se haya hecho all */
                                                                                                response.json(userstoryresult);

                                                                                            });





                                                                                        }
                                                                                        else {

                                                                                            var messagetext = createJSONmsgTask.generateMSGUpdateUS(result, userstoryresult, codefield, codepoints);



                                                                                            messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                                                /* devuelvo el json cuando se haya hecho all */
                                                                                                response.json(userstoryresult);

                                                                                            });


                                                                                        }
                                                                                    });



                                                                                }
                                                                                else {

                                                                                    /* tengo que hacer 1 json para el mensaje */
                                                                                    /*el sprint de antes era vacio, pero el de ahora no lo es
                                                                                    * */

                                                                                    var messagetext = createJSONmsgTask.generateMSGUpdateUS(result, userstoryresult, codefield, codepoints);



                                                                                    messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                                        /* devuelvo el json cuando se haya hecho all */
                                                                                        response.json(userstoryresult);

                                                                                    });


                                                                                }









                                                                            } /* end else !err */
                                                                        }); /* method newuserstory */

                                                                    }
                                                                }
                                                            });




                                                        }
                                                        else if(codefield == 10){
                                                            /* miramos si el resultado de US tiene sprints, sino no hacemos nada */
                                                            if(userstoryexists.sprint !== undefined &&
                                                                userstoryexists.sprint !== null &&
                                                                userstoryexists.sprint !== '' ){
                                                                /* lo buscamos despues de updatear para evitar problemas */

                                                                userstoryservice.updateuserstoryById (userstoryid, null, codefield).then(function (error, userstoryresult) {
                                                                    if (error) {
                                                                        response.status(error.code).json({message: error.message});
                                                                    } else {

                                                                        socketio.getIO().sockets.to('CH_' + channelid).emit('updateUserstory', {userstory: userstoryresult});



                                                                        /* antes de crear el mensaje buscamos el sprint anterior */
                                                                        sprintservice.checksprintexistsByIdCH(channelid, userstoryexists.sprint).then(function (error, sprintresult) {
                                                                            if(!error &&
                                                                                sprintresult !== undefined &&
                                                                                sprintresult !== null &&
                                                                                sprintresult !== ''){

                                                                                /* cambiamos el codefield para que sea como el de assignar sprint */

                                                                                codefield = 9;
                                                                                codepoints = {};
                                                                                codepoints.old = sprintresult;


                                                                                var messagetext = createJSONmsgTask.generateMSGUpdateUS(result, userstoryresult, codefield, codepoints);



                                                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                                    /* devuelvo el json cuando se haya hecho all */
                                                                                    response.json(userstoryresult);

                                                                                });




                                                                            }
                                                                        });





                                                                    } /* end else !err */
                                                                }); /* method newuserstory */







                                                            }
                                                            else{
                                                                var err = {
                                                                    code: 403,
                                                                    message: "Userstory is already unlinked from sprint."
                                                                };
                                                                response.status(err.code).json({message: err.message});

                                                            }









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
                                                                    var messagetext = createJSONmsgTask.generateMSGUpdateUS(result, userstoryresult, codefield, codepoints);



                                                                    messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                        /* devuelvo el json cuando se haya hecho all */
                                                                        response.json(userstoryresult);

                                                                    });


                                                                } /* end else !err */
                                                            }); /* method newuserstory */

                                                        }









                                                    }/* end else userstoryresult !== undefined */
                                                } /* end else !error*/


                                            }); /* end method getuserstorybyid para saber que existe en el canal */


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











/******************************* !!!!!!!!!!! importante, ahora mismo no tenemos issues,
 * pero cuando tengamos pueda que se asocien a US, luego habria que borrarlas *********************************************************/

/** deleteuserstories **/


exports.deleteuserstories = function deleteuserstories (request, response){

    var userid = request.params.userid;
    var channelid = request.params.channelid;
    var groupid = request.params.groupid;
    var userstoryid = request.params.userstoryid;




    if(userid == undefined || userid == null || userid == "undefined" || userid == "null" ||userid == '' ||
        channelid == undefined || channelid == null || channelid == "undefined" || channelid == "null" || channelid == '' ||
        groupid == undefined || groupid == null || groupid == "undefined" || groupid == "null" || groupid == '' ||
        userstoryid == undefined || userstoryid == null || userstoryid == "undefined" || userstoryid == "null" || userstoryid == '' ){
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

                                /* miramos que exista el US dentro del canal, porque puede existir pero no es propietario */

                                /* tengo el US con los ids de las tareas */
                                userstoryservice.getuserstoryByIdWithInPopulate (channelid, userstoryid).then(function (error, userstoryexists) {
                                    if (error) {
                                        response.status(error.code).json({message: error.message});
                                    } else {

                                        if (userstoryexists == undefined || userstoryexists == null || userstoryexists == '') {
                                            var err = {
                                                code: 402,
                                                message: "Userstory to delete not found inside channel requested."
                                            };
                                            response.status(err.code).json({message: err.message});

                                        }
                                        else {

                                            /* esto retorna el US de nuevo */
                                            userstoryservice.deleteTaskByIdRemovedUS(userstoryexists).then(function (error, sameuserstory) {
                                                if (error) {

                                                    response.status(error.code).json({message: error.message});
                                                }

                                                else {
                                                   /* si ALL ha ido bien, borramos el US */
                                                    console.log("estoy en controller,depues de borrar las tareas");
                                                    userstoryservice.deleteuserstoryById (userstoryid)
                                                        .then(function (error, userstoryresultid) {
                                                            if (error) {

                                                                response.status(error.code).json({message: error.message});
                                                            }

                                                            else {

                                                                socketio.getIO().sockets.to('CH_' + channelid).emit('deleteUserstory', {userstoryid: userstoryid});


                                                                /* tengo que hacer 1 json para el mensaje **********************/
                                                                var messagetext = createJSONmsgTask.generateMSGDeleteUS(result, userstoryexists);


                                                                messageservice.newinternalmessage(messagetext, channelid).then(function (error, message) {

                                                                    response.json({
                                                                        userstoryid: userstoryid,
                                                                        message: 'Userstory deleted successfully'
                                                                    });


                                                                });



                                                            }
                                                        });


                                                }

                                            });


                                        }
                                    }



                                }); /* end method getuserstorybyid para saber que existe en el canal */


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
























