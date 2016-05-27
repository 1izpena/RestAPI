/**
 * Created by izaskun on 31/03/16.
 */

'use strict';


/************** faltaria hacer 1 servicio que hable con la bd, cuando me ponga conesto lo reviso *********************/
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


/* para meter nuevos id de repositorios en mongo


db.channels.update({},{$addToSet: {githubrepositories:53012875}},false,true)
*
*
*
*
* */


/* importante:: revisar que tengo bien que al añadir un repo al canal
* el id coincide con el del webhook, ahora esta raro */
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

    console.log("entro en controllers/github con newEventGithub");



    var User = mongoose.model('User');

    User.search({mail: config.internalUserMail}, 1)
        .then(function(error, internalUser) {
            if(!error){

                console.log("entro en user.search !error");

                /*
                * messageJSON.repository.id
                * {githubrepositories:messageJSON.repository.id}
                 */

                console.log(" antes de channel search la query vale:");
                console.log(messageJSON.repository.id);
                /* 53012875 angular */

                /* queda mirar que al crear
                * los webhooks lo haga bien, elmeter en el canal
                * el id del repo correcto */

                var query = {"githubRepositories.id":messageJSON.repository.id};
                var Channel = mongoose.model('Channel');

                Channel.search(query, 1).then(function(error, channel) {
                        if (!error) {

                            console.log("entro en channel search !error");
                            console.log("esto vale channel");
                            console.log(channel);

                            /***
                             * vuelta, la bd en este momento corrompida:
                             * tiene: users [ids]
                             *          githubRepositories [ids ]
                             *          _admin: id
                             *          group: id
                             *          channelType: 'PUBLIC',
                                        channelName: 'General',
                                        _id: 56cb893773da764818ec5df1
                             *
                             */


                            /* tengo el user y el canal */

                            console.log("esto vale channel.id");
                            console.log(channel.id);

                            var messageData = {
                                channelid: channel.id,
                                userid: internalUser.id,
                                messageType: 'TEXT',
                                text: JSON.stringify(message),
                                serviceType : 'GITHUB'
                            };



                            /******************* new tareas ***********************************/
                                /* me queda hacer 1 push,
                                ver que se guarda el mensaje en la bd (hecho)
                                y que se envia por sockets,
                                 luego falta parsearlo en el cliente y xultimo en ionic (mirar que lo hace en angular)
                                 ademas borrar las variables de los del canal y ver que se muestra al final
                                 tambien si se borra el canal eliminar los webhooks

                                 */

                            var Message = mongoose.model('Message');
                            Message.newMessage(messageData).then(function newmessage(error, result) {
                                if (!error) {


                                    /* que esta mal */
                                    console.log("esto vale el id del grupo ");
                                    console.log(channel.group);
                                    /* lo hace bien
                                     *
                                     * 56cb893773da764818ec5df0
                                     *
                                     * */


                                    console.log("esto vale el result de newMessage");
                                    console.log(result);


                                    /*
 { id: 5717ee444763d6341548220f,
  channel:
   { id: 56cb893773da764818ec5df1,
     channelName: 'General',
     channelType: 'PUBLIC' },
  user:
   { id: 56cb8a1c63202f68056c1196,
     username: 'meanstack',
     mail: 'internalUser@localhost' },
  date: Wed Apr 20 2016 23:01:56 GMT+0200 (CEST),
  messageType: 'TEXT',
  text: '"{\\"event\\":\\"push\\",\\"repository\\":
  {\\"id\\":53012875,\\"name\\":\\"angularProject\\"},
  \\"ref\\":\\"refs/heads/master\\",\\"commits\\":[
  {\\"id\\":\\"63dfa554e5e35e08e555fa6450d85df00342a1cf\\",\\"url\\":\\
  "https://github.com/1izpena/angularProject/commit/63dfa554e5e35e08e555fa6450d85df00342a1cf\\",
  \\"author\\":\\"1izpena\\"}],\\"sender\\":{\\"login\\":\\"1izpena\\",\\"html_url\\":\\"https://github.com/1izpena\\"}}"' }

                                     *
                                     * *************/


                                    // Hay que notificar al canal de que hay nuevo mensaje

                                    console.log("esto vale groupid que vamos a mandar : ");
                                    console.log(channel.group);

                                    console.log("esto vale el channelid que vamos a mandar :");
                                    console.log(messageData.channelid);

                                    socketio.getIO().sockets.to('CH_' + messageData.channelid).emit('newMessage', {groupid: channel.group,message: result});


                                    Channel.parsepopulated(messageData.channelid).then(function (error, channel) {
                                        if (error){
                                            return null;
                                        }

                                        else {

                                            /* tengo que conseguir en nombre del grupo */
                                            var Group = mongoose.model('Group');


                                            /* esto me esta petando */
                                            console.log("esto vale channel channel.group");
                                            console.log(channel);

                                            /**
                                             * esto vale channel:
                                             { id: 56cb893773da764818ec5df1,
                                               channelName: 'General',
                                               channelType: 'PUBLIC',

                                               /* esta parte cambia, ahora group tiene tambien el nombre *
                                               group: { groupId: 56cb893773da764818ec5df0, groupName: 'Dessi' },


                                               admin:
                                                { id: 56cb873c73da764818ec5dea,
                                                  username: 'amaia',
                                                  mail: 'amaia@mail.es' },
                                               users:
                                                [ { id: 56cb873c73da764818ec5dea,
                                                    username: 'amaia',
                                                    mail: 'amaia@mail.es' },
                                                  ... ] }
                                             ***/


                                            /* no me funcionan los sockets */



                                            console.log("channelType: " + channel.channelType);
                                            var roomName = 'CH_'+channel.id;

                                                     /* cogemos a los usuarios del canal */
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
                                                         {groupid: channel.group.groupId,  groupName: channel.group.groupName ,
                                                         channelName: channel.channelName, channelid: channel.id,
                                                         channelType: channel.channelType, message: result});
                                                }
                                            }

                                            return result;



                                        }

                                    });  /* channel parse populated */










                                            //query = {_id: channel.group.groupId};

                                            /* no se porque hace esto, no haria falta creo */


                                            /*
                                            Group.search(query, 1).then(function(error, group) {
                                                if (error) {
                                                    console.log("hay error en search group ");
                                                    console.log(error);

                                                    return null;
                                                }


                                                else{
                                                    /* esto para que ??*

                                                    console.log("channelType: " + channel.channelType);
                                                    var roomName = 'CH_'+channel.id;

                                                    /* cogemos a los usuarios del canal *
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

                                                        /********************************
                                                        if (encontrado == false ){
                                                            console.log("Emit newMessageEvent");
                                                            socketio.getIO().sockets.to('US_'+ channel.users[j].id).emit('newMessageEvent',
                                                                {groupid: channel.group.groupId,  groupName: channel.group.groupName ,
                                                                    channelName: channel.channelName, channelid: channel.id,
                                                                    channelType: channel.channelType, message: result});
                                                        }
                                                    }

                                                    return result;



                                                }

                                            }); /***** end search group ****


                                        }
                                    }); /* channel parse populated */
                                }

                                else{
                                    console.log("entro en guardar mensaje:: newmessage:: con error");
                                    console.log(error);
                                    return null;
                                }

                            });/* end save message */



                            /********************** end new ***********************************/


                        } /************ si distinto de error en buscar canal ************/


                        else {

                            console.log("entro en channel search con error");
                            console.log(error);

                            return null;
                        }


                    });


            } /* end if user.search !error */
            else{

                console.log("entro en user search con error");
                console.log(error);
                return null;
            }


            /* buscamos el canal que tenga ese repo */





        });


        /*)
        Message.newMessage(messageData).then(function newmessage(error, result) {
            if (!error) {
    */


    /* buscar channel */
    /*
    User.search({mail: config.internalUserMail}, 1)*/

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




    /**********
     *
     *entro en 3
     esto vale commits[0]
     {"id":"ca92ef20e459fb7313d1e4a0a6ce5c11993e6003","tree_id":"ee8822df911ce5fc6d761153946f57c2bcd06b55","distinct":true,"message":"Añadida funcionalidad de crear canal y asociar los webhooks","timestamp":"2016-04-20T20:34:51+02:00","url":"https://github.com/1izpena/angularProject/commit/ca92ef20e459fb7313d1e4a0a6ce5c11993e6003","author":{"name":"1izpena","email":"1izpena@opendeusto.es","username":"1izpena"},"committer":{"name":"1izpena","email":"1izpena@opendeusto.es","username":"1izpena"},"added":["app/scripts/services/githubservice.js"],"removed":[],"modified":["app/index.html","app/scripts/app.js","app/scripts/controllers/chat2.js","app/scripts/services/channelservice.js","app/scripts/services/chatservice.js","app/styles/chat2.css","app/views/chat2.html","bower.json","test/karma.conf.js"]}
     hacemos lo mismo en el CONTROLLER
     convert String to JSON
     angularProject
     Esto vale commits
     como json
     { event: 'push',
       repository: { id: 53012875, name: 'angularProject' },
       ref: 'refs/heads/master',
       commits:
        [ { id: 'ca92ef20e459fb7313d1e4a0a6ce5c11993e6003',
            url: 'https://github.com/1izpena/angularProject/commit/ca92ef20e459fb7313d1e4a0a6ce5c11993e6003',
            author: '1izpena' } ],
       sender: { login: '1izpena', html_url: 'https://github.com/1izpena' } }
     como string
     {"event":"push","repository":{"id":53012875,"name":"angularProject"},"ref":"refs/heads/master","commits":[{"id":"ca92ef20e459fb7313d1e4a0a6ce5c11993e6003","url":"https://github.com/1izpena/angularProject/commit/ca92ef20e459fb7313d1e4a0a6ce5c11993e6003","author":"1izpena"}],"sender":{"login":"1izpena","html_url":"https://github.com/1izpena"}}
     vale null el neweventgithub
     *
     *
     *
     *
     *
     *
     *
     * *****************/



    /*var obj = {};
    var body;
    */


    if(request.headers !== undefined && request.body !== undefined){
        //console.log("entra en request.headers !== undefined");
        //console.log(request.headers);
        //console.log("esto vale la cabecera que quermos");
        //console.log(request.headers['x-github-event']);

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




