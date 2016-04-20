/**
 * Created by izaskun on 31/03/16.
 */

'use strict';



/****** new ******/
var config = require('../config');
var githubHandler = require('../helpers/githubHandler');

var mongoose = require('mongoose');
var socketio  = require('../helpers/sockets');
var io = require('socket.io');


var channelservice  = require('../services/channel');
async = require("async");


var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var Message  = require('../models/message');

/********************************************************/

//var channelCtrl = require('../controllers/message');


/*
 * User.search({mail: config.internalUserMail}, 1).then(function(error, internalUser) {
 var messageData = {
 channelid: data.channelid,
 userid: internalUser.id ,
 messageType: 'TEXT',
 text: "internalMessage#NEW_ANSWER. QuestionId: '" + messageAnswer.id +
 "'. AnswerId: '" + messageAnswer.answer.id + "" +
 "'"
 };
 *
 * */



/********************************************************/


/* var GitHubApi = require("github"); */

/* tiramos de POST para el mensaje */
/* mirar como coger al internal user o meter otro que sea github */
/* no estaria mal que de gravatar saliera el de github */

function newEventGithub (obj) {


    /* data creo que es el cuerpo del mensaje */
    /* var fieldsReq = [];

     if (!data.messageType) {
     fieldsReq.push('messageType');
     }
     else {
     if (data.messageType == 'TEXT' || data.messageType == 'URL') {
     if (!data.text) {
     fieldsReq.push('text');
     }*/

    /* hay que buscar el canal con ese repositorio asociado y hacer 1 post y luego sockets al canal */


    /* data lo cambiamos por message */
    /*var data = obj.message;*/

    /* mirar que tiene un message, type...*/

    /* hay que coger el id del repo */



    /* buscar el internal user:: existe si o si, sino habría que meterlo */


    /* mirar que devuelve obj.message */
    var messageJSON= JSON.parse(obj.message);


    var User = mongoose.model('User');

    User.search({mail: config.internalUserMail}, 1)
        .then(function(error, internalUser) {
            if(!error){

                /* buscar el canal
                *
                * messageJSON.repository.id
                *
                * {githubrepositories:messageJSON.repository.id}
                *
                *
                * */

                var query = {githubrepositories:messageJSON.repository.id};

                var Channel = mongoose.model('Channel');

                Channel.search(query, 1).then(function(error, channel) {
                        if (!error) {

                            /* tengo el user y el canal */

                            var messageData = {
                                channelid: channel.id,
                                userid: internalUser.id,
                                messageType: 'TEXT',
                                text: JSON.stringify(message)
                            };



                            /******************* new ***********************************/
                                /* me queda hacer 1 push,
                                ver que se guarda el mensaje en la bd
                                y que se envia por sockets,
                                 luego falta parsearlo en el cliente y xultimo en ionic
                                 ademas borrar las variables de los del canal y ver que se muestra al final
                                 tambien si se borra el canal eliminar los webhooks

                                 estamos a lunes, para el miercoles tiene que estar terminado

                                 */

                            var Message = mongoose.model('Message');
                            Message.newMessage(messageData).then(function newmessage(error, result) {
                                if (!error) {

                                    // Notificamos al canal que hay nuevo mensaje

                                    console.log("esto vale el id del grupo ");
                                    console.log(channel.group);


                                    socketio.getIO().sockets.to('CH_' + messageData.channelid).emit('newMessage', {groupid: channel.group,message: result});



                                    Channel.parsepopulated(messageData.channelid).then(function (error, channel) {
                                        if (error){
                                            return null;
                                        }

                                        else {

                                            /* tengo que conseguir en nombre del grupo */

                                            var Group = mongoose.model('Group');

                                            query = {_id: channel.group};
                                            Group.search(query, 1).then(function(error, group) {
                                                if (error) {

                                                    return null;
                                                }


                                                else{

                                                    console.log("channelType: " + channel.channelType);
                                                    var roomName = 'CH_'+channel.id;
                                                    for (var j=0;j<channel.users.length;j++){
                                                        var encontrado = false;
                                                        for (var socketid in socketio.getIO().sockets.adapter.rooms[roomName]) {
                                                            if ( socketio.getIO().sockets.connected[socketid]) {
                                                                var connectedUser = socketio.getIO().sockets.connected[socketid].userid;
                                                                if (connectedUser && connectedUser == channel.users[j].id ) {
                                                                    encontrado = true;
                                                                }
                                                            }
                                                        }

                                                        /********************************/
                                                        if (encontrado == false ){
                                                            console.log("Emit newMessageEvent");
                                                            socketio.getIO().sockets.to('US_'+ channel.users[j].id).emit('newMessageEvent',
                                                                {groupid: group.id,  groupName: group.groupName ,
                                                                    channelName: channel.channelName, channelid: channel.id,
                                                                    channelType: channel.channelType, message: result});
                                                        }
                                                    }

                                                    return result;



                                                }

                                            }); /***** end search group ****/


                                        }
                                    }); /* channel parse populated */
                                }

                                else{
                                    return null;
                                }

                            });/* end save message */



                            /********************** end new ***********************************/


                        } /************ si distinto de error en buscar canal ************/


                        else {
                            return null;
                        }


                    });


            } /* end if user.search !error */
            else{
                return null;
            }


            /* buscamos el canal que tenga ese repo */





        });


        /*)
        Message.newMessage(messageData).then(function newmessage(error, result) {
            if (!error) {
    */


    /* buscar channel */
    User.search({mail: config.internalUserMail}, 1)

    /***********************
     *
     *
     *  User.search({mail: config.internalUserMail}, 1).then(function(error, internalUser) {
                                            var messageData = {
                                                channelid: data.channelid,
                                                userid: internalUser.id ,
                                                messageType: 'TEXT',
                                                text: "internalMessage#NEW_ANSWER. QuestionId: '" + messageAnswer.id +
                                                "'. AnswerId: '" + messageAnswer.answer.id + "" +
                                                "'"
                                            };
                                            Message.newMessage(messageData).then(function newmessage(error, result) {
                                                if (!error) {
     *
     *
     * *********************/





};




/* POST */
exports.callbackPOST = function callbackPOST (request, response) {
    console.log("esto valeresponseee callback2");

    /* miramos que los eventos coinciden con los
     * que queremos parsear
     * */




    /*var obj = {};
    var body;
    */

    if(request.headers !== undefined && request.body !== undefined){
        if(request.headers['x-github-event'] !== undefined){




            /* parsear en el helper: githubHandler */
            /* devuelve el msg y el id del repo, que es el id del canal */
            var obj = githubHandler.getFieldsEvents(request.headers['x-github-event'], request.body);


            /* si es !== null mandamos xsocket el mensaje y lo guardamos en la bd */
            if(obj !== null){

                /* el objeto que recibo es 1 JSON
                * tiene el id del repo
                * y el mensaje en string*/

                console.log("hacemos lo mismo en el CONTROLLER");

                console.log("convert String to JSON");
                var message4= JSON.parse(obj.message);
                console.log(message4.repository.name);

                if(message4.event == "push"){
                    console.log("Esto vale commits");
                    console.log("como json");
                    console.log(message4)
                    console.log("como string");
                    console.log(JSON.stringify(message4));


                    /* vamos a intentar guardarlo en la bd */
                    /* es como hacer 1 post de un mensaje */
                }



/************* metodo controller mirar si hay notificaciones para los nuevos canales *****************/


                /* obj es el mensaje que queremos guardar, hay que mirar que tiene cada uno  */
                /* obj ya es 1 JSON o 1 array no lo se */
                var res = newEventGithub(obj);
                if(res == null){
                    console.log("vale null el neweventgithub");
                }
                else{
                    console.log("se ha guardado bien el mensaje");
                    console.log(res);
                }


                /******************** end metodo controller+******************************/



            }

        }
        else {
            /* si no es 1 evento no hacemos nada */
            console.log("sin x-github, no es 1 evento");
            console.log(request.headers);
        }

    }




    /* mirar si el objeto es undefined antes de cargarlo a la bd */

    //console.log(response);
    response.json({message: 'Fu4ciona2.'});
};

/* GET */
exports.callbackGET = function callbackGET (request, response) {
    console.log("esto valeresponseee callbackGET");
    console.log(request);

    response.json({message: 'Fu4ciona3****.'});
};




