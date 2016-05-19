/**
 * Created by izaskun on 1/04/16.
 */


var config = require('../config');
var Auth  = require('../helpers/authentication');
var GitHubApi = require("github");
async = require("async");
var githubapiservice = require('../services/githubapi');

var channelservice  = require('../services/channel');
var mongoose = require('mongoose');

var socketio  = require('../helpers/sockets');
var io = require('socket.io');
var config  = require('../config');




function deleteauthCtrl (username,pass, resultcreateTokenId, response){

    /* si hay problema al guardar el token, se quita la auth */
    githubapiservice.deleteAuth(username,pass, resultcreateTokenId).then(function (err,resu) {
        if (err) {

            /*si hay error al borrar, nos daria igual,que lo borre a pelo o igual no existe */

            console.log("hay error en deleteauth");
            console.log(err);
            response.status(err.code).json({message: err.message});




        } else {
            console.log("NO hay error en deleteauth Y ESTO VALE RESU");
            /* { meta:
             { 'x-ratelimit-limit': '5000',
             'x-ratelimit-remaining': '4983',
             'x-ratelimit-reset': '1462933609',
             status: '204 No Content' } }
             */

            /* hay que decirle de alguna manera que flag a empty otra vez */

            console.log(resu);
            response.status(204).json({message: "Unable to save Github authorization. Please try again."});



        }

        response.end();
        return;

    });

}


function getRepositoriesWithoutWebHooks (githubtoken, newResult, response) {

   /* { token: 'ace2371d758c6c9359a6da448a6603ef7415d9da',
        username: '2jonpena',
        _id: 57327130bec748f144b63835 }

        */



    console.log("dentro de getRepositoriesWithoutWebHooks esto vale githubtoken");
    console.log(githubtoken);


    newResult.arrRepos = [];
    githubapiservice.getRepositories(githubtoken.token).then(function (error,result){


        var resp = {};

        if(!error) {
            /*es 1 array */
            /* result[0]. */
            /* hacemos 1 array con el nombre de los repos */


            if(result !== undefined && result !== null){
                if(result.length){



                    /* me devuelve 1 lista de repos sin webhook */
                    githubapiservice.getWebHooks(githubtoken, result).then(function (error,result) {
                        if (error) {

                            if(error.code == '504'){

                                console.log("hay error en controller al coger los repos 1");
                                response.status(error.code).json({message: "Gateway Timeout"});


                            }
                            else{
                                var messageJSON= JSON.parse(error.message);

                                if(error.code == 401){
                                    /* esto es lo que devolvería el checkauthorization */
                                    error.code = 404;
                                    messageJSON.message = "Access Token not found. Login Again or choose another account."

                                }
                                response.status(error.code).json({message: messageJSON.message});


                            }
                            response.end();
                            return;


                        }
                        else {

                            console.log("*********************************");
                            console.log("esto vale resp");

                            newResult.arrRepos = result;



                            response.json(newResult);
                            response.end();
                            return;



                        }
                    });




                }
                else{


                    response.json(newResult);
                    response.end();
                    return;
                }

            }
            else{
                response.json(newResult);
                response.end();
                return;

            }
            /* else array vacio */

        }
        /* hay error */

        else{


            if(error.code == '504'){

                console.log("hay error en controller al coger los repos 1");
                response.status(error.code).json({message: "Gateway Timeout"});


            }
            else{
                var messageJSON= JSON.parse(error.message);
                console.log("hay error en controller al coger los repos 1");
                /* entra por aqui y dice bad credentials, 401 cuando se ha borrado el token manualmente */

                console.log("hay error en controller al coger los repos 1");

                if(error.code == 401){
                    /* esto es lo que devolvería el checkauthorization */
                    error.code = 404;
                    messageJSON.message = "Access Token not found. Login Again or choose another account."

                }


                response.status(error.code).json({message: messageJSON.message});


            }
            response.end();
            return;




        }

    }); /* end getrepositories */


};







function newchannelGithub (userid, groupid, channelGithub, arrReposOk, channelgithubtoken) {


    /* repositories es 1 array con item.id*/
    channelservice.createnewchannel(userid, groupid,
        channelGithub.channelName, channelGithub.channelType,
        null, null,
        arrReposOk, channelgithubtoken)
        .then(function (error,channel){
            if (error){
                /*response.status(error.code).json({message: error.message});*/
                return error;




            }else {


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



                    }
                });
            }
        });




};





/* esta en routes/user */
exports.getAccountsGithub = function getAccountsGithub (request, response) {


    var userid = request.params.userid;
    Auth(request, response).then(function (error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }
        else {

            if (userid == result._id) {

                /* solo va a devolver 1 usuario con ese id */
                githubapiservice.getUserAccounts(userid).then(function (error, result) {
                    if (error) {

                        /* aqui solo bd, no llamadas al api */
                        response.status(error.code).json({message: error.message});
                    }

                    else {
                        /* devuelve el array de githubtokens (username, token) o null */
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


    var userid= request.params.userid;
    var username = request.body.username;

    /*la pass puede ir vacia si ya tiene la cuenta */
    var pass = request.body.pass;


    /* meter flag y asi hacemos lo mismo */
    var rebuildAuth = request.body.rebuildAuth;
    if(rebuildAuth == 'true'){
        rebuildAuth = true;
    }
    else{
        rebuildAuth = false;

    }


    var arrRepos = [];
    var oldToken = null;



    if(userid !== undefined && userid !== null &&
        username !== undefined && username !== null ){

        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
                response.end();
                return;

            }
            else {
                if (userid == result._id){


                    githubapiservice.getUserToken(userid, username).then(function (error,result){

                        if(error){
                            response.status(error.code).json({message: error.message});
                            response.end();
                            return;
                        }

                        else{

                            /* aqui tengo el objeto entero *
                             * mirar si es nulo, hay que crear el token
                             */

                            var newResult = {};


                            if((result == null && rebuildAuth == false) || (result !== null && rebuildAuth == true)){

                                if(pass == undefined || pass == null || pass == ''){
                                    response.status(400).json({message: 'Bad Request. Missing required parameters: password.'});

                                }

                                else{

                                    if(rebuildAuth == true){
                                        oldToken = result;
                                    }




                                    githubapiservice.createToken(userid,username,pass).then(function (error,result){
                                        if(error){

                                            console.log("error en controller githubapi creando token2");


                                            var messageJSON= JSON.parse(error.message);

                                            console.log(error);

                                            response.status(error.code).json({message: messageJSON.message});
                                            response.end();
                                            return;


                                        }
                                        else{
                                            /* puede que no haya error pero tampoco token */
                                            /* le avisamos */

                                            if(result == null ){

                                                response.status(503).json({message: "Creating Github authorization for Meanstack failed. " +
                                                "Please try again. "});
                                                response.end();
                                                return;

                                            }
                                            else{

                                                /* si rebuildAuth ha ido bien guardamos::
                                                 * updateamos el nuevo token en user */


                                                var resultcreateToken = result;


                                                githubapiservice.saveUserToken(userid, username, result, oldToken).then(function (error,result){
                                                    if(error){

                                                        deleteauthCtrl (username, pass, resultcreateToken.id, response);


                                                    }
                                                    else{

                                                        /* si no hay error al guardar, actualizamos repos de canal, haya o no error, no nos importa
                                                         * estara equivocada la ref de los repos, peo creamos una nueva authorizacion, esto no se
                                                          * que devolvera habra que mirar si el token es diferente */




                                                        /* aqui si hay llamada al api */
                                                        /* result:: objto github token dentro (token/username/_id) */
                                                        /* puede ser vacio o null */


                                                        if(result !== null && result !== undefined){
                                                            if(result.token !== null && result.token !== undefined){
                                                                newResult.githubtoken = result;
                                                                getRepositoriesWithoutWebHooks(result, newResult, response);

                                                            }
                                                            else{

                                                                /* no haria nada */

                                                                /* no hay token en la bd, el guardado a sido failed */
                                                                /* luego habría que hacer 1 delete auth para que se pueda loguear de nuevo
                                                                 * y se repita la movida otra vez  */
                                                                deleteauthCtrl (username, pass, resultcreateToken.id, response);




                                                            }


                                                        }
                                                        /* no hay token, si lo hay siempre pos de 0 */
                                                        else{

                                                            /* ha habido error al guardarlo, habria que hacer 1 revoke? */
                                                            deleteauthCtrl (username, pass, resultcreateToken.id, response);

                                                        }

                                                    }
                                                }); /* end saveUserToken */


                                            }/* else no hay error pero no hay token */


                                        } /* end else:: no hay error en crear el token */
                                    }); /* end create token */

                                } /* fin de pass no vacia */


                            } /* end if result es null de getUserToken, aunque no haya error */

                            /* no es nulo, luego existe: aqui result es solo el token */
                            else {

                                /*la result puede no ser nula, pero si el username.flag existe
                                 * hay que generar el token
                                 * y hacer el mismo proceso de arriba */
                                /* es el tokengithub con token/username/_id */
                                /* lo cogemos de la bd y miramos si existe,
                                 si hago getrepos me da badcredentials, vamos a intentar que no lo haga */



                                if(result.token !== null && result.token !== undefined){
                                    newResult.githubtoken = result;
                                    getRepositoriesWithoutWebHooks(result, newResult, response);

                                }
                                else{
                                    /* la result no tiene token guardado en la bd */
                                    /* luego tendria que loguearse de nuevo */
                                    response.status(404).json({message: "Github token not found. Please signup again."});
                                    response.end();
                                    return;

                                }



                            }/* end else:: result no es null de getUserToken */

                        } /* no hay error en getUserToken*/




                    }); /* end getUserToken */



                }
                else {

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



/* debemos cambiar la ruta */
exports.createHooks = function createHooks (request, response) {


    var userid = request.params.userid;
    //var username = request.body.username;



    /* es 1 array */
    var repositories = JSON.parse(request.body.repositories);

    /* es 1 json */

    /* ahora account es username solo y es 1 string */
    //var account = JSON.parse(request.body.account);
    var account = request.body.account;

    /* necesitamos pasar el id del grupo y el nombre y tipo del canal */


    console.log("esto vale account con username");
    console.log(account);
    //console.log(account.token);

    /* hay que coger el name y el id */

    /*haciendo for y recogiendo name e id de cada uno funciona */



    /* hay que mirar que githubchannel no sea type direct */


    var githubchannel = JSON.parse(request.body.githubchannel);
    var groupid = request.body.groupid;

    /************** new ********************/





    /* miramos que no sean vacios los campos */

    if (userid !== undefined && userid !== null &&
        account !== undefined && account !== null &&
        repositories !== undefined && repositories !== null &&
        githubchannel !== undefined && githubchannel !== null &&
        groupid !== undefined && groupid !== null) {

        if(githubchannel.channelType !== 'DIRECT'){
            Auth(request, response).then(function (error, result) {
                if (error) {
                    response.status(error.code).json({message: error.message});
                    response.end();
                    return;
                }

                else {
                    /* si es el mismo seguimos */
                    if (userid == result._id) {


                        /* buscamos su token en la bd */


                        /***************************modi****************************************/

                        githubapiservice.getUserToken(userid, account).then(function (error,result){

                            console.log("entra en getusertoken");

                            if(error){

                                /* aqui solo bd, no llamadas al api */
                                response.status(error.code).json({message: error.message});
                                response.end();
                                return;
                            }

                            else{

                                console.log("entra en getusertoken para createwebhooks sin error");

                                /* aqui tengo el objeto entero */
                                /* mirar si es nulo, hay que crear el token
                                 * */
                                var newGithubtoken = {};

                                /* si no lo encuentra, mandarle a que se loguee otra vez*/
                                console.log("result");
                                console.log(result);



                                if(result == null ){
                                    response.status(404).json({message: "Github token not found. Please signup again."});
                                    response.end();
                                    return;


                                }
                                else {

                                    if(result.token !== null && result.token !== undefined &&
                                        result.username !== null && result.username !== undefined){

                                        newGithubtoken.token = result.token;
                                        newGithubtoken.username = result.username;


                                        /* creamos los hooks, ya tenemos el token */
                                        githubapiservice.createHooks(newGithubtoken, repositories).then(function (error, result) {
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
                                                            /*
                                                             con esto funcionaba
                                                             result.reschannel =  newchannelGithub(userid, groupid, githubchannel, repositories);
                                                             */
                                                            result.reschannel =  newchannelGithub(userid, groupid, githubchannel, result.arrReposOk, newGithubtoken);






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
                                        response.status(404).json({message: "Github token not found. Please signup again."});
                                        response.end();
                                        return;

                                    }


                                }/* end else:: result no es null de getUserToken */

                            } /* no hay error en getUserToken*/




                        }); /* end getUserToken */




                        /*************************** end modi ***********************************************/

                    }

                    else{
                        response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
                        response.end();
                        return;


                    }
                }
            });

        }/* if no es direct */
        else {
            response.status(400).json({message: 'Bad Request. It is not possible to integrate a direct channel with Github.'});
            response.end();
            return;

        }




    }

    else{
        response.status(400).json({message: 'Bad Request. Missing required parameters'});
        response.end();
        return;
    }
};

/************** end of new *****************/
















