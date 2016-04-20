/**
 * Created by izaskun on 1/04/16.
 */



/****** new ******/
var config = require('../config');
var Auth  = require('../helpers/authentication');
var GitHubApi = require("github");
async = require("async");
var githubapiservice = require('../services/githubapi');
var channelcontroller = require('../controllers/channel');

/*
var util = require('util');*/





var channelservice  = require('../services/channel');
var mongoose = require('mongoose');

var socketio  = require('../helpers/sockets');
var io = require('socket.io');
var config  = require('../config');
//var channelCtrl = require('../controllers/message');




/* cuando cree 1 canal
* hay que meter en grupo y en canal el usuario interno */
/*
*
*
* */


    function newchannelGithub (userid, groupid, channelGithub, repositories) {


    /* repositories es 1 array con item.id*/



    channelservice.createnewchannel(userid, groupid,
        channelGithub.channelName, channelGithub.channelType,
        null,
        repositories)
        .then(function (error,channel){
            if (error){
                /*response.status(error.code).json({message: error.message});*/
                return error;




            }else {


                /* cuando se crea 1 canal nuevo, habría que meterlo
                 en el array de notificaciones ????????????????????*/
                var Group = mongoose.model('Group');
                Group.parsepopulated(userid, groupid).then(function (error, group) {
                    if (error){
                        /*response.status(error.code).json({message: error.message});
                         */
                        return error;


                    }
                    else {
                        if (channelGithub.channelType == "PUBLIC"){
                            var roomName = 'CH_'+channel.id;
                            var conectedUsers = socketio.getUsersInSocket(roomName);
                            for (var i=0;i<channel.users.length;i++){
                                if(channel.users[i].id != userid){
                                    if (conectedUsers.indexOf(channel.users[i]) == -1){
                                        console.log("Emit newChannelEvent for new public channel");
                                        socketio.getIO().sockets.to('US_'+channel.users[i].id).emit('newChannelEvent', {groupid: group.id, groupName: group.groupName, channelid: channel.id,channelName: channel.channelName, channelType:channel.channelType});

                                    }
                                }
                            }
                            socketio.getIO().sockets.to('GR_'+ groupid).emit('newPublicChannel', channel);
                        }
                        if (channelGithub.channelType == "PRIVATE"){
                            socketio.getIO().sockets.to('US_'+ userid).emit('newPrivateChannel', channel);
                        }
                        console.log("channel successfully created... ");
                        /*response.json(channel);*/

                        return channel;

                        /* y hago la vuelta en el otro si es que hay que hacer algo */


                    }
                });
            }
        });




};




/* solo llamadas de la bd */
/* y esto para darle las opciones de los tokens que ya tiene asociados en la bd si los quiere usar */
/* aunque podríamos mandarle solo el login */


/* esta en routes/user */
exports.getAccountsGithub = function getAccountsGithub (request, response) {


    var userid = request.params.userid;
    Auth(request, response).then(function (error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }
        else {

            if (userid == result._id) {

                /* solo va atener 1 */
                githubapiservice.getUserAccounts(userid).then(function (error, result) {
                    if (error) {

                        /* aqui solo bd, no llamadas al api */
                        response.status(error.code).json({message: error.message});
                    }

                    else {
                        /* devuelve el objeto token o null*/
                        /* me devuelve todas las acccounts */
                        console.log("esto vale result en controllers");
                        console.log(result);
                        response.json(result);

                    }
                });

            }

            else{
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});

            }
        }



    });
};





exports.auth = function auth (request, response) {

/* para borrar token de la bd;
* db.users.update({},{$unset: {githubtoken:1}},false,true)
 */

    /* habría que meter token, username, mail y mirar en ambos campos
    * si dejamos que lo haga xmail */

    var userid= request.params.userid;
    var username = request.body.username;

    /*la pass puede ir vacia si ya tiene la cuenta */
    var pass = request.body.pass;

    var arrRepos = [];
    var usertoken = "";

    if(userid !== undefined && userid !== null &&
        username !== undefined && username !== null ){

        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
                response.end();
                return;

            } else {

                if (userid == result._id){
                    /* llamadas a la bd */


                    /* podemos probar si coincide
                    con el username y sino coincide
                    le borramos el que tiene y le metemos otro */
                    githubapiservice.getUserToken(userid, username).then(function (error,result){
                        if(error){

                            /* aqui solo bd, no llamadas al api */
                            response.status(error.code).json({message: error.message});
                            response.end();
                            return;
                        }

                        else{


                            /* aqui tengo el objeto entero */
                            /* mirar si es nulo, hay que crear el token
                             * */
                            var newResult = {};

                            // si no lo encuentra si que hay que decir que la pass tiene que estar
                            if(result == null){

                                if(pass == undefined || pass == null || pass == ''){
                                    response.status(400).json({message: 'Bad Request. Missing required parameters'});

                                }
                                else{

                                    githubapiservice.createToken(userid,username,pass).then(function (error,result){
                                        if(error){

                                            console.log("error en controller githubapi creando token");
                                            /* viene stringifiao ay que hacer el parse al reves */
                                            var messageJSON= JSON.parse(error.message);
                                            response.status(error.code).json({message: messageJSON.message});
                                            response.end();
                                            return;


                                        }
                                        else{
                                            /* puede que no haya error pero tampoco token */
                                            /*le avisamos */
                                            if(result == null ){
                                                /* mirar que codigo podemos mandar */
                                                response.json({message: "No se ha conseguido el token, intentelo de nuevo más tarde"});
                                                response.end();
                                                return;

                                            }
                                            else{

                                                /* solo el token */
                                                usertoken = result;

                                                /* solo llamada a la bd */
                                                /* hay que guardar el token */
                                                githubapiservice.saveUserToken(userid, username, result).then(function (error,result){
                                                    if(error){
                                                        response.status(error.code).json({message: error.message});
                                                        response.end();
                                                        return;

                                                    }else{


                                                        /* aqui si hay llamada al api */
                                                        /* result:: objto github token dentro (token/username/_id) */
                                                        /* puede ser vacio o null */


                                                        if(result !== null){

                                                            newResult.githubtoken = result;

                                                            githubapiservice.getRepositories(result).then(function (error,result){

                                                                if(!error) {
                                                                    /*es 1 array */
                                                                    /* result[0]. */
                                                                    /* hacemos 1 array con el nombre de los repos */


                                                                    if(result !== undefined && result !== null){
                                                                        if(result.length){


                                                                            newResult.arrRepos = result;



                                                                            /* mirar para cada uno si tiene 1 hook asociado */
                                                                            /* me devuelve 1 lista de repos sin webhook */

                                                                            githubapiservice.getWebHooks(newResult.githubtoken, result).then(function (error,result) {
                                                                                if (error) {

                                                                                    console.log("error en controller githubapi getwebhooks");
                                                                                    /* viene stringifiao ay que hacer el parse al reves */
                                                                                    var messageJSON = JSON.parse(error.message);
                                                                                    response.status(error.code).json({message: messageJSON.message});
                                                                                    response.end();
                                                                                    return;
                                                                                }
                                                                                else {


                                                                                    /* me los devuelve enteros, solo quiero el name y el id
                                                                                     * para angular*/

                                                                                    //newResult.githubtoken = usertoken;
                                                                                    newResult.arrRepos = result;

                                                                                    /* hay que coger los repos asociados */
                                                                                    response.json(newResult);
                                                                                    response.end();
                                                                                    return;

                                                                                }
                                                                            });




                                                                        }
                                                                        else{


                                                                            newResult.arrRepos = arrRepos;
                                                                            response.json(newResult);
                                                                            response.end();
                                                                            return;
                                                                        }

                                                                    }
                                                                    else{

                                                                        newResult.arrRepos = arrRepos;
                                                                        response.json(newResult);
                                                                        response.end();
                                                                        return;
                                                                    }
                                                                    /* else array vacio */

                                                                }
                                                                /* hay error */

                                                                else{
                                                                    console.log("hay error en controller al coger los repos");

                                                                   //
                                                                    if(error.code == '504'){

                                                                        console.log("hay error en controller al coger los repos 1");
                                                                        response.status(error.code).json({message: "Gateway Timeout"});


                                                                    }
                                                                    else{
                                                                        var messageJSON= JSON.parse(error.message);
                                                                        console.log("hay error en controller al coger los repos 1");
                                                                        response.status(error.code).json({message: messageJSON.message});


                                                                    }
                                                                    response.end();
                                                                    return;

                                                                }

                                                            }); /* end getrepositories */





                                                        }
                                                        /* no hay token, si lo hay siempre pos de 0 */
                                                        else{
                                                            response.status(422).json({message: "Validation Failed"});
                                                            response.end();
                                                            return;

                                                        }

                                                    }
                                                }); /* end saveUserToken */


                                            }/* else no hay error pero no hay token */


                                        } /* end else:: no hay error en crear el token */
                                    }); /* end create token */

                                } /* fin de pass no vacia */


                            } /* end if result es null de getUserToken, aunque no haya error */
                            /* no es nulo, luego existe,
                             * hay que pedir los repos
                             * y mandar respuesta */
                            /* aqui la result es solo el token */
                            else {

                                /* es el tokengithub con token/username/_id */
                                newResult.githubtoken = result;


                                githubapiservice.getRepositories(newResult.githubtoken).then(function (error, result) {

                                    if (!error) {

                                        /*
                                         /* hacemos 1 array con el nombre de los repos */
                                        if (result !== undefined && result !== null) {
                                            if (result.length) {


                                                githubapiservice.getWebHooks(newResult.githubtoken, result).then(function (error,result) {
                                                    if (error) {

                                                        console.log("error en controller githubapi getwebhooks");
                                                        /* viene stringifiao ay que hacer el parse al reves */
                                                        var messageJSON = JSON.parse(error.message);
                                                        response.status(error.code).json({message: messageJSON.message});
                                                        response.end();
                                                        return;

                                                    }
                                                    else {

                                                        newResult.arrRepos = result;

                                                        response.json(newResult);
                                                        response.end();
                                                        return;


                                                    }
                                                });


                                            }
                                            /* aqui sería vacio */
                                            else{

                                                newResult.arrRepos = arrRepos;
                                                response.json(newResult);
                                                response.end();
                                                return;
                                            }

                                        }
                                        /* else array vacio */
                                        else{

                                            newResult.arrRepos = arrRepos;
                                            response.json(newResult);
                                            response.end();
                                            return;

                                        }




                                    }/* si hay error deberiamos notificar??, en este caso si
                                     xq es que tenemos mal las credenciales del usuario, el token que esta guardado en la bd
                                     se esta intentando autenticar y no funciona
                                     */
                                    else{


                                        if(error.code == '504'){
                                            console.log("hay error en controller al coger los repos 1");
                                            response.status(error.code).json({message: "Gateway Timeout"});


                                        }
                                        else{
                                            var messageJSON= JSON.parse(error.message);
                                            response.status(error.code).json({message: messageJSON.message});


                                        }
                                        response.end();
                                        return;



                                    }


                                    /*si las credenciales son erroneas deberia petar
                                     * error code 401
                                     * mensaje = message.message
                                     * aunque esto no debería pasar */
                                    /* puede pasar si tenemos 1 token que ha sido borrado
                                     * luego, lo creamos otra vez t updateamos el token */





                                });
                            }/* end else:: result no es null de getUserToken */

                        } /* no hay error en getUserToken*/




                    }); /* end getUserToken */



                } else {

                    response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
                    response.end();
                    return;
                }
            }
        });

    }
    else{
        response.status(400).json({message: 'Bad Request. Missing required parameters'});
        response.end();
        return;

    }





};


/* con eso valdría */
/*nos tiene que pasar 1 array de repos y el username */

/* cambiamos la ruta */
exports.createHooks = function createHooks (request, response) {


    var userid = request.params.userid;
    //var username = request.body.username;



    /* es 1 array */
    var repositories = JSON.parse(request.body.repositories);

    /* es 1 json */
    var account = JSON.parse(request.body.account);

    /* necesitamos pasar el id del grupo y el nombre y tipo del canal */


    console.log("esto vale account con token");
    console.log(account);
    console.log(account.token);

    /* hay que coger el name y el id */

    /*haciendo for y recogiendo name e id de cada uno funciona */


    /* miramos que no sean vacios los campos */
    var githubchannel = JSON.parse(request.body.githubchannel);

    var groupid = request.body.groupid;




    /************** new ********************/






    if (userid !== undefined && userid !== null &&
        account.token !== undefined && account.token !== null &&
        repositories !== undefined && repositories !== null &&
        githubchannel !== undefined && githubchannel !== null &&
        groupid !== undefined && groupid !== null) {


        Auth(request, response).then(function (error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
                response.end();
                return;
            }

            else {
                /* si es el mismo seguimos */
                if (userid == result._id) {

                    /* creamos los hooks, ya tenemos el token */
                    githubapiservice.createHooks(account, repositories).then(function (error, result) {
                        if (error) {

                            console.log("error en controller githubapi creando hooks");


                            if (error.message !== undefined || error.message !== null) {
                                console.log("error en controller githubapi creando hooks1");
                                /* entra xaqui */
                                error.message = JSON.parse(error.message);


                            }

                            /*
                             * 422 unprocesable entity::
                             * Hook already exists on this repository :: ya tiene el hook creado
                             * 404 not found:: no existe
                             *
                             * */

                           /* var res = newchannelGithub(result._id, groupid, githubchannel, repositories);

*/
                            /* hay que mirar si entra x aqui
                            * */

                            console.log("antes de enviar eerror en controller/github api");

                            response.status(error.code).json(error);
                            /* esto tiene el error */
                            /* githubMessageErrors.item = item;
                             githubMessageErrors.code = err.code
                             githubMessageErrors.message = err.message*/
                            /* solo mandamos el primer error */
                            response.end();
                            return;


                        }

                        /* si no hay error */
                        else {
                            /* esto luego hay que cambiarlo para el canal, crearlo y asociarlo */

                            if (result == null) {

                                /* en este caso no se crearía el canal y se mostraria */
                                response.status(204).json({message: "No webhooks created"});
                                response.end();
                                return;

                            }

                            /* hay que crear el canal y asignar al idgithub los repos
                             * nunca va a ser nulo yo creo */
                            else {

                                /* antes de contestar creamos el canal */

                                /*if(result.)*/
                                console.log("esto vale result");
                                console.log(result);

                                /*
                                *
                                * esto vale result
                                 { code: 201, arrReposOk: [ { item: [Object], obj: [Object] } ] }
                                 POST /api/v1/users/56cb877e73da764818ec5ded/github/createHooks 201 1965.175 ms - 5449
                                 Error 401 - the user already has a public channel with that name
                                 accediendo a la ruta /api/v1/callback/
                                 esto valeresponseee callback2

                                 *
                                * */

                                if(result.arrReposOk !== undefined && result.arrReposOk !== null){
                                    if(result.arrReposOk.length >0 ){
                                        result.reschannel =  newchannelGithub(userid, groupid, githubchannel, repositories);



                                    }
                                }




                                /* debe entrar x aqui creamos el canal */
                                response.status(result.code).json(result);
                                response.end();
                                return;
                            }
                        }


                    });
                }

                else{
                    response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
                    response.end();
                    return;


                }
            }
        });
    }

    else{
        response.status(400).json({message: 'Bad Request. Missing required parameters'});
        response.end();
        return;
    }
};







