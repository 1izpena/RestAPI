/**
 * Created by izaskun on 4/04/16.
 */


var User = require('../models/user');
var mongoose = require('mongoose');
var Hope  = require('hope');
var GitHubApi = require("github");
async = require("async");
var config = require('../config');




function createGithubObj () {

    var github = new GitHubApi({
        // required
        version: "3.0.0",
        // optional
        debug: true,
        protocol: "https",
        host: "api.github.com", // should be api.github.com for GitHub
        timeout: 5000,
        headers: {
            "user-agent": "Meanstack" // GitHub is happy with a unique user agent
        }
    });
    return github;

}



function authenticateBasicGithub (github, username, pass){
    github.authenticate({
        type: "basic",
        username: username,
        password: pass

    });


    return github;
}




function authenticateOauthGithub (github, token){
    github.authenticate({
        type: "oauth",
        token: token
    });


    return github;
}




function authorizationCreateGithub (github, promise){

    github.authorization.create({
        scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook"],
        note: "Meanstack App",
        note_url: config.meanstackUrl,
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {

        if (err) {
            console.log("error en create auth");
            console.log(err);
            return promise.done(null, null);
        }

        else if (res.token && res.id) {
            return promise.done(null, res);

        }
        else {
            return promise.done(null, null);

        }
    });

}



function authorizationDeleteGithub(github, id, promise){

    github.authorization.delete({
        id: id,
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if (err) {

            console.log("error en delete auth");
            console.log(err);
            return promise.done(err,null);


        }

        else{
            // creamos el token
            authorizationCreateGithub(github, promise);

        }

    });

}



function refactorToken(github, promise){
    github.authorization.getAll({
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if (err) {

            console.log("esto vale err");
            console.log(err);
            return promise.done(err,null);


        }


        else{
            console.log("esto vale el resultado de getall de autentificacion");
            console.log(res);

            var restemp = {};

            /* es 1 array. lo recorremos y miramos que la nota sea la misma (Meanstack App) */

            if(res.length){
                for( var i = 0; i< res.length ; i++){

                    if(res[i].note == 'Meanstack App' ){

                        if(res[i].id !== null &&
                            res[i].id !== undefined &&
                            res[i].id !== ''){

                            restemp.id = res[i].id;
                        }

                        i = res.length;

                    }
                } /*end for */

                if(restemp.id !== undefined &&
                    restemp.id !== null &&
                    restemp.id !== '') {
                    console.log("entramos en borrar despues de encontrar la nota");

                    // borramos y creamos, si borrar da error, decirle que lo haga a mano
                    // si conseguimos borrar y no crear, 503 y que se loguee de nuevo :: return promise.done(null,null);
                    authorizationDeleteGithub(github, restemp.id, promise);


                }
                else {
                    console.log("esto no deberia pasar");
                    /* que se loguee de nuevo y cree otra auth
                     * ya que no encuentra la auth */
                    return promise.done(null,null);

                }


            }/* res es 1 array */
            /* no debería pasar, xq viene de 1 error dnd hay auth*/
            else{
                console.log("esto no deberia pasar");
                /* que se loguee de nuevo y cree otra auth */
                return promise.done(null,null);

            }

        } /* else de if error al coger authorizaciones */


    });
}





/* para borrar LA AUTHENCTIFICACION de github si no se ha guardado bien en la bd */
exports.deleteAuth = function deleteAuth (username,pass, authid) {

    var promise = new Hope.Promise();

    if(authid !== undefined && authid !== null){


        var github = createGithubObj();
        github = authenticateBasicGithub(github, username, pass);


        github.authorization.delete({
            id: authid,
            headers: {
                "X-GitHub-OTP": "two-factor-code"
            }
        }, function(err, res) {
            if (err) {

                return promise.done(err,null);


            }
            else{
                console.log("esto vale el resultado de borrar la autentificacion");
                console.log(res);
                return promise.done(null,res);

            }

        });


    }
    else{
        return promise.done(null,null);

    }

    return promise;

}




exports.getUserAccounts = function getUserAccounts (userid) {

    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    var query = { _id: userid };

    /* solo tiene que ser 1 */
    User.searchConToken(query).then(function(error, user) {

        if (user === null) {
            return promise.done(error,null);


        } else {

            if(user.length !== undefined){
                var user = user[0];

                /* devolvemos array con tokens o null */
                if(user.githubtoken !== undefined && user.githubtoken !== null){
                    if(user.githubtoken[0] !== undefined){

                        return promise.done(null,user.githubtoken);
                    }
                    else{
                        /* no hay token */
                        return promise.done(null,null);
                    }
                }
                else{
                    return promise.done(null,null);
                }
            }
            /* el array de usuarios es vacio */
            else{
                return promise.done(null,null);
            }
        }
    });

    return promise;

};







exports.createToken = function createToken (userid, username, pass) {

    var promise = new Hope.Promise();

    var github = createGithubObj();
    github = authenticateBasicGithub(github, username, pass);


    github.authorization.create({
        scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook"],
        note: "Meanstack App",
        note_url: config.meanstackUrl,
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if (err) {

            /* si el error es 422, significa que ya existe en github y no en nuestra bd
            * buscamos (getall), borramos (deleteauth) y creamos (createauth) */

            if(err.code == 422){
                refactorToken(github, promise);
            }
            else{
                return promise.done(err,null);

            }

        }
        else if(res.token && res.id){
            return promise.done(null,res);

        }
        else{
            return promise.done(null,null);

        }
    });

    return promise;

};






/* esto es para aquellos que tienen token en meanstack y no en github
* al reves no haria falta actualizar nada en la bd */

exports.saveUserToken = function saveUserToken(userid, username, auth, oldToken){
    var User = mongoose.model('User');
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();


    var query;
    var update;
    var options;


    if(oldToken !== null && oldToken !== undefined){

        query = {"githubtoken" :{$elemMatch: {"token": oldToken.token}}};

        update = {$set : {
            "githubtoken.$.username": username,
            "githubtoken.$.token": auth.token,
            "githubtoken.$.authid": auth.id
        }};



    }
    else {

        console.log("con push");
        query = { _id: userid};
        update = {$push : {githubtoken:{username:username, token:auth.token, authid:auth.id}}};


    }
    /* return the modified document rather than the original */
    options = { new: true};

    User.updateusergithubtoken(query,update,options).then(function (error,user){


        console.log("esto vale user en services con updateusergithubtoken");
        console.log(user);
        /*
        * /*
         * user
         { githubtoken:
         [ { _id: 57328aec15f9ed084f5d3d51,
         username: '1izpena',
         token: 'e6a03da0363cf1c53825a5dd3aaad8a7c8bbc34e',
         authid: 31889897 } ],..
        *
        * */


        if(error){
            return promise.done(error,null);
        }
        else{
            if (user === null) {

                /* no lo ha encontrado, no deberia de pasar,
                 * x id siempre estara, xoldtoken tambien  */
                return promise.done(null,null);


            } else {

                /* una vez hecho esto, habría que modificar los repositorios asociados */
                /* me devuelve un usuario, con eso cambiado */
                if(user.githubtoken !== undefined && user.githubtoken !== null){

                    /* solo va a tener 1 token */
                    //return promise.done(null,user.githubtoken[0]);

                    var githubtokentemp = {};
                    if(user.githubtoken[0] !== undefined){


                        for(var i = 0; i< user.githubtoken.length; i++){
                            if(user.githubtoken[i].username !== undefined){
                                if(user.githubtoken[i].username == username){
                                    githubtokentemp = user.githubtoken[i];
                                }
                            }



                        }

                        if(githubtokentemp.token == undefined){
                            return promise.done(null,null);

                        }
                        else{
                            return promise.done(null,githubtokentemp);
                        }

                            /* aqui que tenemos el token, luego actualizamos tambien los repos */

                          //  if(oldToken !== null && oldToken !== undefined){
                           //     if(oldToken.token !== null && oldToken.token !== undefined){

                                    /*old token
                                     *
                                     *
                                     * { authid: 31888981,
                                     token: 'e59555d697ec86498a9e6b57a80d4829d7f2bc2a',
                                     username: '1izpena',
                                     _id: 57328aec15f9ed084f5d3d51 }

                                     *
                                     *
                                     * */


                              /*      query = {"githubtoken" :{$elemMatch: {"token": oldToken.token}}};

                                    update = {$set : {
                                        "githubtoken.$.username": username,
                                        "githubtoken.$.token": auth.token
                                    }};

                                    options = { multi: true, new: true };
                                    //options = { new: true};

                                    Channel.updaterepositoriesgithubtoken(query,update,options).then(function (error,channel) {

                                        console.log("esto vale channel en services con updaterepositoriesgithubtoken");
                                        console.log(channel);


                                        if (error) {
                                            error.description = githubtokentemp;
                                            return promise.done(error, null);
                                        }
                                        else {

                                            return promise.done(null,githubtokentemp);

                                        }
                                    });


                                }
                                else{
                                    return promise.done(null,githubtokentemp);

                                }


                            }
                            else{
                                return promise.done(null,githubtokentemp);

                            }


                        }/* end else con if token == undefined */



                    } /* end if usergithubtoken[0] !== undefined */
                    else{
                        /* no hay token */
                        return promise.done(null,null);

                    }

                }/* end if usergithubtoken !== undefined */
                else{
                    return promise.done(null,null);
                }

            } /* else del if user == null */


        }
    });
    return promise;


};




/* devuelve 1 array con 1 tokens */
exports.getUserToken = function getUserToken(userid, username){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    var query = { _id: userid };



    /* solo tiene que ser 1 */
    User.searchConToken(query).then(function(error, user) {
        if (user === null) {
            return promise.done(error,null);


        } else {


            console.log("esto vale user");
            console.log(user);

            /* es 1 array de usuarios, siempre solo 1*/
            if(user.length !== undefined){
                var user = user[0];

                console.log("esto vale user en searchcontoken");
                console.log(user);
                var githubtokentemp = {};

                if(user.githubtoken !== undefined && user.githubtoken !== null){


                    if(user.githubtoken[0] !== undefined){


                        for(var i = 0; i< user.githubtoken.length; i++){
                            if(user.githubtoken[i].username !== undefined){
                                if(user.githubtoken[i].username == username){
                                    githubtokentemp = user.githubtoken[i];
                                }
                            }

                        }

                        if(githubtokentemp.token == undefined){
                            return promise.done(null,null);

                        }
                        else{
                            return promise.done(null,githubtokentemp);

                        }


                    }
                    else{
                        /* no hay token */
                        return promise.done(null,null);

                    }


                }
                //hay que crearse el token
                else{
                    return promise.done(null,null);


                }


            }
            /* el array de usuarios es vacio */
            else{
                return promise.done(null,null);
            }



        }
    });
    return promise;
};





/***************** new change ***********************/
exports.getWebHooks = function getWebHooks (githubtoken, arrRepos){


    console.log("entro en webhooks");
    var promise = new Hope.Promise();

    var arrReposDef = [];


    var github = createGithubObj();
    github = authenticateOauthGithub(github, githubtoken.token);



    async.each(arrRepos,
        // 2nd param is the function that each item is passed to
        function (item, callback){
            // Call an asynchronous function,

            github.repos.getHooks({

                user: githubtoken.username,
                repo: item.name,

                headers: {
                    "X-GitHub-OTP": "two-factor-code"
                }

            }, function(err, res) {
                if (err) {
                    console.log(err);
                    githuberror = true;

                }

                else{


                    /* no tiene length sino tiene hooks asociados */
                    if(!res.length){

                        arrReposDef.push(item);
                        console.log("entro en webhooks, en if");

                    }
                    /********************** añadido, no se si funcionara **********************/

                    else{
                        var enc = false;
                        for(var i = 0; i< res.length; i++){
                            if(res[i].config !== undefined && res[i].config !== null){
                                if(res[i].config.url !== undefined && res[i].config.url !== null){
                                    console.log("esto vale res[i].config.url");
                                    console.log(res[i].config.url);
                                    if(res[i].config.url !== config.githubcallback){
                                        /* si no coincide se mete en el array el repo */
                                         enc = true;
                                         console.log("**************enc**********");
                                         console.log(enc);
                                    }
                                }
                            }
                        }
                        if(enc) {
                            console.log("entro en el if !enc con ");
                            console.log(item.name);
                            arrReposDef.push(item);
                        }
                        console.log("entro en webhooks, en else");
                    }

                    /********** añadido, no se si funcionara ********************/




                }
                callback(); //required
            });


        },

        // 3rd param is the function to call when everything's done
        function(err){

            if(err){
                console.log('Error:' + err);
                return promise.done(err,null);
            }

            // All tasks are done now
            else{

                console.log("esto vale arrReposDef");
                console.log(arrReposDef[0].name);

                return promise.done(null,arrReposDef);


            }
        }
    );

    return promise;



};



/******************** end new change *********************************/



/* solo el token  */
exports.getRepositories = function getRepositories(githubtoken){


    var promise = new Hope.Promise();


    var github = createGithubObj();
    github = authenticateOauthGithub(github, githubtoken);


    github.repos.getAll({

        type: "owner",
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if (err) {
            console.log("error al get repos");
            console.log(err);
            return promise.done(err,null);

        }
        else {

            return promise.done(null,res);


        }

    });


    return promise;
};






/* undefined gestionado en controller */
exports.createHooks = function createHooks(githubtoken, arrRepos){

    var promise = new Hope.Promise();


    var github = createGithubObj();
    github = authenticateOauthGithub(github, githubtoken.token);


    var arrErrors = [];
    var arrOk = [];

    var githuberror = false;




    /* item.name item.id necesarios */
    async.each(arrRepos,
        // 2nd param is the function that each item is passed to
        function (item, callback){
            // Call an asynchronous function,
            github.repos.createHook({

                user: githubtoken.username,
                repo: item.name,
                name: "web",
                config: {

                    url: config.githubcallback,
                    content_type: "json"
                },
                events: ["*"],
                active:true,

                headers: {
                    "X-GitHub-OTP": "two-factor-code"
                }

            }, function(err, res) {
                if (err) {
                    console.log("dentro del foreach con rror");
                    console.log(err);
                    console.log(item);


                    var githubMessageErrors = {};

                    githubMessageErrors.item = item;
                    //githubMessageErrors.item.githubtoken = githubtoken;
                    githubMessageErrors.code = err.code;

                    if(err.code == '504'){

                        githubMessageErrors.message = "Gateway Timeout";

                    }
                    else{
                        githubMessageErrors.message = JSON.parse(err.message);

                    }


                    arrErrors.push(githubMessageErrors);
                    githuberror = true;


                }
                else{
                    console.log("dentro del foreach sine rror");
                    console.log(res);

                    var githubMessageOk = {};

                    /* tenemos que añadir a item, el id asociado al webhook
                     * de momento tiene id y nombre del repo */
                    if(res !== null && res !== undefined ){
                        if(res.id !== null && res.id !== undefined){
                            item.hookid = res.id;

                        }
                    }



                    githubMessageOk.item = item;
                    //githubMessageOk.item.githubtoken = githubtoken;

                    githubMessageOk.obj= res;

                    console.log("esto vale item");
                    console.log(item);

                    arrOk.push(githubMessageOk);

                }
                callback(); //required
            });
        },

        // 3rd param is the function to call when everything's done
        function(err){

            if(err){
                console.log('Error:' + err);


                err.arrReposError = arrErrors;
                err.arrReposOk = arrOk;
                return promise.done(err,null);
            }

            // All tasks are done now
            else{

                if(githuberror){
                    /* 422 Hook already exists on this repository */

                    var errores = {};

                    errores.code = 200;
                    errores.arrReposError = arrErrors;
                    errores.arrReposOk = arrOk;
                    return promise.done(null,errores);





                }
                else{

                    var ok = {};
                    ok.code = 201;
                    ok.arrReposOk = arrOk;

                    return promise.done(null,ok);

                }




            }
        }
    );



    return promise;
};









/* esto hay que cambiarlo, ahora no funcionaria,
esta intentando coger token de cada repo y ahora esta en elcanal */
exports.deleteHooks = function deleteHooks(arrRepos, githubtoken){

    var promise = new Hope.Promise();

    var github = createGithubObj();
    github = authenticateOauthGithub (github, githubtoken.token);


    var arrErrors = [];
    var arrOk = [];
    var githuberror = false;




    /* item.name item.id necesarios */
    async.each(arrRepos,
        // 2nd param is the function that each item is passed to
        function (item, callback){
            // Call an asynchronous function,

            console.log("esto vale item");
            console.log(item);


            github.repos.deleteHook({

                user: githubtoken.username,
                repo: item.name,
                id: item.hookid,
                headers: {
                    "X-GitHub-OTP": "two-factor-code"
                }

            }, function(err, res) {
                if (err) {
                    console.log("dentro del foreach de delete con rror");
                    console.log(err);
                    console.log(item);


                    var githubMessageErrors = {};
                    githubMessageErrors.item = item;
                    githubMessageErrors.code = err.code;

                    if(err.code == '504'){

                        githubMessageErrors.message = "Gateway Timeout";



                    }
                    else{
                        githubMessageErrors.message = JSON.parse(err.message);



                    }

                    arrErrors.push(githubMessageErrors);
                    githuberror = true;


                }
                else{

                    /* si all va bien no tienes porque devolver nada */
                    console.log("dentro del foreach de delete sine rror");
                    console.log(res);

                    var githubMessageOk = {};


                    console.log("esto vale item");
                    console.log(item);
                    githubMessageOk.item = item;
                    githubMessageOk.obj= res;

                    arrOk.push(githubMessageOk);

                }
                callback(); //required
            });



        },

        // 3rd param is the function to call when everything's done
        function(err){

            if(err){
                console.log('Error:' + err);


                /* esta bien saber cuales estan bien borrados y cuales no */
                /* hay que controlarlo en angular */
                err.arrReposError = arrErrors;
                err.arrReposOk = arrOk;
                return promise.done(err,null);
            }

            // All tasks are done now
            else{

                if(githuberror){

                    var errores = {};
                    errores.code = 200;
                    errores.arrReposError = arrErrors;
                    errores.arrReposOk = arrOk;

                    return promise.done(null,errores);


                }
                else{

                    var ok = {};
                    ok.code = 201;
                    ok.arrReposOk = arrOk;

                    return promise.done(null,ok);

                }

            }
        }
    );



    return promise;
};
