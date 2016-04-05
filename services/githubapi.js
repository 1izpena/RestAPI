/**
 * Created by izaskun on 4/04/16.
 */



var User = require('../models/user');
var mongoose = require('mongoose');
var Hope  = require('hope');
var GitHubApi = require("github");
async = require("async");
var config = require('../config');



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
        note: "what this auth is for",
        note_url: "http://url-to-this-auth-app",
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if (err) {

            return promise.done(err,null);
            /* puede petar xq ya este creado */
            /* entonces update */

        }
        else if (res.token) {

            /* hay que guardar el token en la bd */
            return promise.done(null,res.token);

        }
        else{
            return promise.done(null,null);

        }
    });

    return promise;

};



exports.saveUserToken = function saveUserToken(userid, username, token){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();

    var query = { _id: userid};
    var update = {$push : {githubtoken:{username:username, token:token}}};
    /* return the modified document rather than the original */
    var options = { new: true};


    User.updateuser(userid,update,options).then(function (error,user){
        if(error){
            return promise.done(error,null);
        }else{
            if (user === null) {
                return promise.done(error,null);


            } else {

                /* me devuelve un usuario */
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


/* queremos miras los hooks que ya estan asociados alos repos, para no ponerlos */
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

                    var enc = false;
                    console.log("entro en webhooks, no hay errores");

                    /* no tiene length sino tiene hooks asociados */
                    if(!res.length){
                        /* para cada posicion mirar si config.url coincide con lo nuestro */

                        arrReposDef.push(item);

                        console.log("entro en webhooks, en if");

                    }

                    else{
                        for(var i = 0; i< res.length; i++){
                            if(res[i].config !== undefined && res[i].config !== null){
                                if(res[i].config.url !== undefined && res[i].config.url !== null){

                                    console.log("esto vale res[i].config.url");
                                    console.log(res[i].config.url);
                                    if(res[i].config.url !== config.githubcallback){
                                        /* si no coincide se mete en el array el repo */
                                         enc= true;

                                         }
                                }

                            }
                        }
                        if(!enc) {

                            arrReposDef.push(item);


                        }

                        console.log("entro en webhooks, en else");
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

                return promise.done(null,arrReposDef);


            }
        }
    );

    return promise;



};





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


    console.log("esto avle token para coger los repos");
    /* es un array si lo coje de la bd
     * no lo es si lo ha creado */
    console.log(githubtoken);


    github.authenticate({
        type: "oauth",
        token: githubtoken.token
    });


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
    var githubMessageErrors = {};
    var githubMessageOk = {};

    /* es el nombre del repo, asique guay */
    async.each(arrRepos,
        // 2nd param is the function that each item is passed to
        function(item, callback){
            // Call an asynchronous function,
            github.repos.createHook({

                user: githubtoken.username,
                repo: item,
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

                    githubMessageErrors.item = item;
                    githubMessageErrors.code = err.code;
                    githubMessageErrors.message = err.message;


                    arrErrors.push(githubMessageErrors);
                    githuberror = true;


                }
                else{
                    console.log("dentro del foreach sine rror");
                    console.log(res);



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

                    if(arrOk.length > 0){
                        return promise.done(null,arrOk);

                    }
                    else{
                        return promise.done(githubMessageErrors,null);
                    }


                }
                else{
                    return promise.done(null,arrOk);

                }




            }
        }
    );



    return promise;
};
