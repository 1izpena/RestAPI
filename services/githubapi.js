/**
 * Created by izaskun on 4/04/16.
 */



var User = require('../models/user');
var mongoose = require('mongoose');
var Hope  = require('hope');
var GitHubApi = require("github");
async = require("async");
var config = require('../config');





exports.getUserAccounts = function getUserAccounts (userid) {


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

            /* es 1 array de usuarios, siempre solo 1 */
            if(user.length !== undefined){
                var user = user[0];


                console.log("esto vale user en searchcontoken");
                console.log(user);

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

    github.authenticate({
        type: "basic",
        username: username,
        password: pass

    });


    github.authorization.create({
        scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook"],
        note: "Meanstack App",
        note_url: config.meanstackUrl,
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if (err) {

            return promise.done(err,null);
            /* puede petar xq ya este creado */
            /* entonces update */

        }
        else if(res.token){
            return promise.done(null,res.token);

        }
        else{
            return promise.done(null,null);

        }


    });

    return promise;

};



exports.saveUserToken = function saveUserToken(userid, username, token, oldToken){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();



    var query;
    var update;
    var options;


/*  422 si ya lo tiene creado , habria que hacer 1 get o algo para recogerlo o para cambiarlo */

    /* aqui cambiar el royo si oldToken es !== null*/

    if(oldToken !== null && oldToken !== undefined){
        /* cambiar el token del usuario xese y
        * cambiar el token de los repositorios de los canales
        * */




        /* falta cambiar los repos asociados,
        mirar si ya hay token y
        la bd esta corrompida,
        no dejar en agular meter la misma cuenta??
        comprobar esto para tods y hacer que haga lo mismo (createwebhooks y delete)
        si en angular create webhooks peta xesto, le devolvemos a la pagina anterior con un error
        para que se loguee de nuevo y cree el token
        con el otro habra que crear una ventana mas
        al loro porque cada repo puede estar asociado a cuentas diferentes,
        esperemos que no peten ambas, podemos decirle que en ese caso se loguee para las 2
        miramos las cuentas de los repositorios, si es la misma que se loguee para ella
        sino hacemos ventanas para cada repositorio
        hay varias cuentas asociadas y ambas petan los repos, eso probar

        despues de esto permitir añadir nuevos repos
         */

        query = {"githubtoken" :{$elemMatch: {"username": username}}};


        update = {$set : {
            "githubtoken.$.username": username,
            "githubtoken.$.token": token
        }};











    }
    else{


        console.log("con push");
        query = { _id: userid};
        update = {$push : {githubtoken:{username:username, token:token}}};


    }
    /* return the modified document rather than the original */
    options = { new: true};





    /* antes con updateuser funcionaba */
    User.updateusergithubtoken(query,update,options).then(function (error,user){


        console.log("esto vale user en services con updateusergithubtoken");
        console.log(user);


        if(error){
            return promise.done(error,null);
        }else{
            if (user === null) {
                return promise.done(error,null);


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

                    /* lo intentamos con esto, sino lo quitamos */


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


/* queremos mirar los hooks que ya estan asociados alos repos, para no ponerlos */
/* este ahora no se usa */
exports.getWebHooks2 = function getWebHooks2 (githubtoken, arrRepos){



    console.log("entro en webhooks");
    var promise = new Hope.Promise();

    var arrReposDef = [];

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


    github.authenticate({
        type: "oauth",
        token: githubtoken.token
    });

    console.log("entro en webhooks, despues de authen");



    async.each(arrRepos,
        // 2nd param is the function that each item is passed to
        function(item, callback){
            // Call an asynchronous function,
            console.log("entro en webhooks, dentro del callback");
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


                    console.log("entro en webhooks, no hay errores");

                    /* no tiene length sino tiene hooks asociados */
                    if(!res.length){
                        /* para cada posicion mirar si config.url coincide con lo nuestro */

                        arrReposDef.push(item);

                        console.log("entro en webhooks, en if");

                    }
                    /*
                     else{
                     var enc = false;
                     for(var i = 0; i< res.length; i++){
                     if(res[i].config !== undefined && res[i].config !== null){
                     if(res[i].config.url !== undefined && res[i].config.url !== null){
                     console.log("esto vale res[i].config.url");
                     console.log(res[i].config.url);
                     if(res[i].config.url !== config.githubcallback){
                     /* si no coincide se mete en el array el repo *
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
                     }*/



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

                return promise.done(null,arrReposDef);


            }
        }
    );

    return promise;



};

/***************** new change ***********************/



exports.getWebHooks = function getWebHooks (githubtoken, arrRepos){



    console.log("entro en webhooks");
    var promise = new Hope.Promise();

    var arrReposDef = [];

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


    github.authenticate({
        type: "oauth",
        token: githubtoken.token
    });

    console.log("entro en webhooks, despues de authen");



    async.each(arrRepos,
        // 2nd param is the function that each item is passed to
        function (item, callback){
            // Call an asynchronous function,
            console.log("entro en webhooks, dentro del callback");



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


                    console.log("entro en webhooks, no hay errores");

                    /* no tiene length sino tiene hooks asociados */
                    if(!res.length){
                        /* para cada posicion mirar si config.url coincide con lo nuestro */

                        arrReposDef.push(item);

                        console.log("entro en webhooks, en if");

                    }




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


    console.log("en get repos en services:: esto vale github token");
    console.log("tiene que ser 1 array para coger .token");

    console.log(githubtoken);

    var promise = new Hope.Promise();

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


    console.log("esto vale token para coger los repos");
    /* es un array si lo coje de la bd
     * no lo es si lo ha creado */
    console.log(githubtoken);


    github.authenticate({
        type: "oauth",
        token: githubtoken

    });



    /* me da 1 time out */
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
            console.log("salgo de coger los repos sin problema");

            return promise.done(null,res);


        }

    });




    return promise;
};


/* tenemos el token y el login + array repos */
/********** lo que me devuelve
 esto vale resen create hook
 { type: 'Repository',
   id: 7861014,
   name: 'web',
   active: true,
   events: [ '*' ],
   config:
    { url: 'https://9c0cbf31.ngrok.io/callback',
      content_type: 'json' },
   updated_at: '2016-03-29T17:02:42Z',
   created_at: '2016-03-29T17:02:42Z',
   url: 'https://api.github.com/repos/1izpena/RestAPI/hooks/7861014',
   test_url: 'https://api.github.com/repos/1izpena/RestAPI/hooks/7861014/test',
   ping_url: 'https://api.github.com/repos/1izpena/RestAPI/hooks/7861014/pings',
   last_response: { code: null, status: 'unused', message: null },
   meta:
    { 'x-ratelimit-limit': '5000',
      'x-ratelimit-remaining': '4993',
      'x-ratelimit-reset': '1459271934',
      'x-oauth-scopes': 'user, public_repo, repo, repo:status, gist, write:repo_hook',
      location: 'https://api.github.com/repos/1izpena/RestAPI/hooks/7861014',
      etag: '"6e12440237398754c7b3b6965a5c8bac"',
      status: '201 Created' } }
 ************************/





/* undefined gestionado en controller */
exports.createHooks = function createHooks(githubtoken, arrRepos){

    var promise = new Hope.Promise();

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


    github.authenticate({
        type: "oauth",
        token: githubtoken.token
    });


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
                    githubMessageErrors.item.githubtoken = githubtoken;
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
                    githubMessageOk.item.githubtoken = githubtoken;
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
                    /* tengo que mirar en github los posibles errores */
                    /* solo piya 1error*/

                    /* 504 para gateway time out */


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



exports.deleteHooks = function deleteHooks(arrRepos){

    var promise = new Hope.Promise();

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





    var arrErrors = [];
    var arrOk = [];

    var githuberror = false;





    /* item.name item.id necesarios */
    async.each(arrRepos,
        // 2nd param is the function that each item is passed to
        function (item, callback){
            // Call an asynchronous function,

            console.log("esto vale item");
            console.log(item.githubtoken);


            /* antes de esto mirar que githubtoken exista, para todos lo que se haga de repos */

            if(item.githubtoken !== undefined && item.githubtoken !== null){
                if(item.githubtoken.token !== undefined && item.githubtoken.token !== null &&
                    item.githubtoken.username !== undefined && item.githubtoken.username !== null){


                    github.authenticate({
                        type: "oauth",
                        token: item.githubtoken.token
                    });




                    github.repos.deleteHook({

                        user: item.githubtoken.username,
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

                }


                else {
                    var err = {
                        code   : 400,
                        message: 'Bad Request. Missing required parameters: Token account foreach repository.'
                    };
                    err.arrReposError = arrErrors;
                    err.arrReposOk = arrOk;
                    return promise.done(err,null);

                }

            }
            else {
                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: Token account foreach repository.'
                };




                err.arrReposError = arrErrors;
                err.arrReposOk = arrOk;
                return promise.done(err,null);

            }






        },

        // 3rd param is the function to call when everything's done
        function(err){

            if(err){
                console.log('Error:' + err);


                /* esta bien saber cuales estan bien creados y cuales no */
                /* hay que controlarlo en angular */
                err.arrReposError = arrErrors;
                err.arrReposOk = arrOk;
                return promise.done(err,null);
            }

            // All tasks are done now
            else{

                if(githuberror){
                    /* 422 Hook already exists on this repository */
                    /* tengo que mirar en github los posibles errores */
                    /* solo piya 1error*/

                    /* 504 para gateway time out */


                    var errores = {};

                    errores.code = 200;
                    errores.arrReposError = arrErrors;
                    errores.arrReposOk = arrOk;
                    return promise.done(null,errores);


                    /* estaria bien pasar los 2 arrays */


                    /*if(arrOk.length > 0){
                     return promise.done(null,arrOk);

                     }
                     else{
                     return promise.done(githubMessageErrors,null);
                     }*/


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
