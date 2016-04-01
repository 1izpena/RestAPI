/**
 * Created by izaskun on 1/04/16.
 */





'use strict';

var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var Token = require('../helpers/token');
var mail  =require('../services/mailer');
var LoginErrorsHandler = require('../helpers/loginErrorsHandler');
var URLService = require('../services/url');




/****** new ******/
var config = require('../config');
var GitHubApi = require("github");

/* esto me sobra */
var github = require('octonode');




exports.prueba1 = function prueba1 (request, response) {



    //        scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook", "admin:org_hook","read:org"],
/*
    github.auth.config({
        username: '2jonpena',
        password: 'c0t0nmiaus'
    }).login(['user', 'repo', 'gist'], function (err, id, token) {
        console.log(id, token);
        console.log(err);
    });

*/



}


/*
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




    /* tiene que ser del usuario de meanstack, para que me de permisos *
    github.authenticate({
        type: "basic",
        username: config.usernamegithub,
        password: config.passgithub
    });


    /*
     http.get(options, function(data) {
     res.render('template', data);
     });


     */


    /* meter esto :: admin:org_hook*
    github.authorization.create({
        scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook", "admin:org_hook","read:org"],
        note: "what this auth is for",
        note_url: "http://url-to-this-auth-app",
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if(err){
            console.log("hay erroe en authorization create");
            console.log(err);
            response.status(404).json(err);


        }
        else if (res.token) {
            console.log("NO error al en authorizacion al repo?? hook");
            console.log(res.token);
            response.json(res.token);


            /* cogemos los repos de la organizacion
            * y por cada 1 nos creamos 1 hook *

            var repo = "RestAPI";
            var user = "1izpena";

            var org = "masterdessi2016";

            /*github.org.getTeamRepos*


            github.repos.createHook({

                user: user,
                repo: repo,
                name: "web",
                config: {
                    url: "http://a95bf9e1.ngrok.io/api/v1/callback",
                    content_type: "json"
                },
                events: ["*"],
                active:true,

                headers: {
                    "X-GitHub-OTP": "two-factor-code"
                }

                /********* reuestlanzada:
                 * port: 443,
                 path: '/repos/1izpena/RestAPI/hooks',
                 method: 'post',
                 headers:
                 { host: 'api.github.com',
                   'content-length': 133,
                   'content-type': 'application/json; charset=utf-8',
                   authorization: 'token 32631cf7a674463b04433d496d2a04933caa2eb8',
                   'x-github-otp': 'two-factor-code',
                   'user-agent': 'Meanstack',
                   accept: 'application/vnd.github.v3+json' } }
                 REQUEST BODY: {"config":{"url":" https://9c0cbf31.ngrok.io/callback","content_type":"json"},"events":["*"],"active":true,"name":"meanstack1izpena"}
                 ***********/

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

                 ************************



            }, function(err, res) {
                if (err) {
                    console.log("error al crear hook");
                    console.log(err);
                    response.status(404).json(err);

                }
                else {
                    console.log("esto vale resen create hook");
                    console.log(res);
                }
            });


        }
        else{

            /* este token hay que guardarlo en la bd, en el canal *
            console.log("hay erroe en authorization create en response ");
            console.log(res);
            response.status(404).json({message: 'Error in authorized.'});




        }
    });

    /*.then (function(error, result) {
     if (error) {
     console.log("error en  github.authenticate ***********");
     console.log(error);


     res.status(404).json(error);

     } else {
     console.log("esto devuelve result github.authenticate ***********");
     console.log(result);



     github.authorization.create({
     scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook"],
     note: "what this auth is for",
     note_url: "http://url-to-this-auth-app",
     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if (res.token) {
     //save and use res.token as in the Oauth process above from now on
     console.log("esto vale el token que tengo usando el scope");
     console.log(token);

     github.repos.createHook({

     user: "1izpena",
     repo: "RestAPI",
     name: "meanstack"+repo,
     config: {
     url: " https://9c0cbf31.ngrok.io/callback",
     content_type: "json"
     },
     /*secret: res.token,*
     events: [
     "*"
     ],
     active:true,

     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if(err){
     console.log("error al crear hook");
     console.log(err);
     res.status(404).json(error);
     }
     else{
     console.log("esto vale resen create hook");
     console.log(res);
     /* intentamos acceder al hook *
     github.events.getFromRepo({

     user: "1izpena",
     repo: "RestAPI",

     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if(err){
     console.log("error al acceder al repo?? hook");
     console.log(err);
     }
     else{
     console.log("esto vale res en acceder al repo?? hook");
     console.log(res);
     /* intentamos acceder al hook *
     res.json(res.parse());





     }
     res.status(404).json(error);




     })


     }




     })

     }
     else{
     console.log("A pasado algo turbio al generar el token");
     if(err){
     console.log("eror");
     console.log(err);
     res.status(404).json(error);

     }
     else{
     console.log("no error pero no tira, esto vale res");
     console.log(res);
     res.status(404).json(error);
     }
     }
     });



     }
     });

     */



//};




























/*
exports.prueba1 = function prueba1 (request, response) {

    /*
    var client = github.client({
        username: config.usernamegithub,
        password: config.passgithub
    });
    */

    /*
    scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook"],
*/

/* nos autentificamos *
        var client = github.auth.config({
            username: config.usernamegithub,
            password: config.passgithub
        }).login(['user', 'repo', 'write:repo_hook'], function (err, id, token) {
            console.log(id, token);
            console.log(err)
        });


    /* creamos el hook para el repo */

    /*

    var ghrepo = client.repo('1izpena/angularProject');
    ghrepo.hook({
        "name": "web",
        "active": true,
        "events": ["*"],
        "config": {
            url: "http://a95bf9e1.ngrok.io/api/v1/callback",
            content_type: "json"
        }
    }, function(err, data, headers) {
        console.log("error: " + err);
        console.log("data: " + data);
        console.log("headers:" + headers);
    });
    */

/* luego lo mismo pero para 1 organizacion */

    /* var ghorg          = client.org('flatiron');
     var ghrepo         = client.repo('pksunkara/hub');
     var ghuser         = client.user('pksunkara');*/


//}



exports.pruebaGithub3 = function pruebaGithub3 (request, response) {

    var repo = "RestAPI";
    var user = "1izpena";
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
        type: "token",
        token: config.githubtokenrestapi
    });


    github.repos.getHooks({

        user: user,
        repo: repo,
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if (err) {
            console.log("error al get hook");
            console.log(err);
            response.status(404).json(err);

        }
        else {
            console.log("esto vale res en get hook");
            console.log(res);






            response.json({message: 'Funciona3.'});



            /* cuando esto funcione quiero hacer 1 get del hooks haber si lo ha creado */


        }

    });


}


exports.pruebaGithub2 = function pruebaGithub2 (request, response) {


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
        type: "token",
        token: config.githubtokenrestapi
    });

    /*
     github.events.getFromRepo({
     user: "1izpena",
     repo: "RestAPI",
     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if(err){
     console.log("hay err");
     console.log(err);
     response.status(404).json({message: 'Error in getfromrepo.'});



     }
     else{
     console.log("no hay error");
     //console.log(res);
     //response.json({message: 'Funciona.'});

     }

     });

     /* ahora intentamos crear el hook*/


    var repo = "RestAPI";
    var user = "1izpena";


    github.repos.createHook({

        user: user,
        repo: repo,
        name: "web",
        config: {
            url: "http://a95bf9e1.ngrok.io/api/v1/callback",
            content_type: "json"
        },
        events: ["*"],
        active:true,

        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }

        /********* reuestlanzada:
         * port: 443,
         path: '/repos/1izpena/RestAPI/hooks',
         method: 'post',
         headers:
         { host: 'api.github.com',
           'content-length': 133,
           'content-type': 'application/json; charset=utf-8',
           authorization: 'token 32631cf7a674463b04433d496d2a04933caa2eb8',
           'x-github-otp': 'two-factor-code',
           'user-agent': 'Meanstack',
           accept: 'application/vnd.github.v3+json' } }
         REQUEST BODY: {"config":{"url":" https://9c0cbf31.ngrok.io/callback","content_type":"json"},"events":["*"],"active":true,"name":"meanstack1izpena"}
         ***********/

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



    }, function(err, res) {
        if (err) {
            console.log("error al crear hook");
            console.log(err);
            response.status(404).json(err);

        }
        else {
            console.log("esto vale resen create hook");
            console.log(res);
        }
    });

    /*
     github.repos.getHooks({

     user: "1izpena",
     repo: repo,
     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if (err) {
     console.log("error al get hook");
     console.log(err);
     response.status(404).json(err);

     }
     else {
     console.log("esto vale res en get hook");
     console.log(res);






     response.json({message: 'Funciona3.'});



     /* cuando esto funcione quiero hacer 1 get del hooks haber si lo ha creado *


     }

     });*/














    /*              response.json({message: 'Funciona2.'});*/



    /* cuando esto funcione quiero hacer 1 get del hooks haber si lo ha creado *


     }




     });
     */

    /*
     github.repos.getHooks({

     user: user,
     repo: repo,
     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if (err) {
     console.log("error al get hook");
     console.log(err);
     response.status(404).json(err);

     }
     else {
     console.log("esto vale res en get hook");
     console.log(res);


     response.json({message: 'Funciona3.'});

     }
     });

     */


    /* intentamos acceder al hook *
     github.events.getFromRepo({

     user: "1izpena",
     repo: "RestAPI",

     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if(err){
     console.log("error al acceder al repo?? hook");
     console.log(err);
     }
     else{
     console.log("esto vale res en acceder al repo?? hook");
     console.log(res);
     /* intentamos acceder al hook *
     res.json(res.parse());





     }
     res.status(404).json(error);




     })


     }




     })








     /*************** fin hooks *********************/




}


exports.pruebaGithub = function pruebaGithub (request, response) {



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




    /* tiene que ser del usuario de meanstack, para que me de permisos */
    github.authenticate({
        type: "basic",
        username: config.usernamegithub,
        password: config.passgithub
    });


    /*
     http.get(options, function(data) {
     res.render('template', data);
     });


     */


    /* meter esto :: admin:org_hook*/
    github.authorization.create({
        scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook"],
        note: "what this auth is for",
        note_url: "http://url-to-this-auth-app",
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if(err){
            console.log("hay erroe en authorization create");
            console.log(err);
            response.status(404).json(err);
            /* puede petar xq ya este creado */
            /* entonces update */

        }
        else if (res.token) {
            console.log("NO error al en authorizacion al repo?? hook");
            console.log(res.token);
            response.json(res.token);


        }
        else{

            /* este token hay que guardarlo en la bd, en el canal */
            console.log("hay erroe en authorization create en response ");
            console.log(res);
            response.status(404).json({message: 'Error in authorized.'});




        }
    });

    /*.then (function(error, result) {
     if (error) {
     console.log("error en  github.authenticate ***********");
     console.log(error);


     res.status(404).json(error);

     } else {
     console.log("esto devuelve result github.authenticate ***********");
     console.log(result);



     github.authorization.create({
     scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook"],
     note: "what this auth is for",
     note_url: "http://url-to-this-auth-app",
     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if (res.token) {
     //save and use res.token as in the Oauth process above from now on
     console.log("esto vale el token que tengo usando el scope");
     console.log(token);

     github.repos.createHook({

     user: "1izpena",
     repo: "RestAPI",
     name: "meanstack"+repo,
     config: {
     url: " https://9c0cbf31.ngrok.io/callback",
     content_type: "json"
     },
     /*secret: res.token,*
     events: [
     "*"
     ],
     active:true,

     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if(err){
     console.log("error al crear hook");
     console.log(err);
     res.status(404).json(error);
     }
     else{
     console.log("esto vale resen create hook");
     console.log(res);
     /* intentamos acceder al hook *
     github.events.getFromRepo({

     user: "1izpena",
     repo: "RestAPI",

     headers: {
     "X-GitHub-OTP": "two-factor-code"
     }
     }, function(err, res) {
     if(err){
     console.log("error al acceder al repo?? hook");
     console.log(err);
     }
     else{
     console.log("esto vale res en acceder al repo?? hook");
     console.log(res);
     /* intentamos acceder al hook *
     res.json(res.parse());





     }
     res.status(404).json(error);




     })


     }




     })

     }
     else{
     console.log("A pasado algo turbio al generar el token");
     if(err){
     console.log("eror");
     console.log(err);
     res.status(404).json(error);

     }
     else{
     console.log("no error pero no tira, esto vale res");
     console.log(res);
     res.status(404).json(error);
     }
     }
     });



     }
     });

     */



};



