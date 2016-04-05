/**
 * Created by izaskun on 1/04/16.
 */



/****** new ******/
var config = require('../config');
var Auth  = require('../helpers/authentication');
var GitHubApi = require("github");
async = require("async");
var githubapiservice = require('../services/githubapi');



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
                githubapiservice.getUserToken(userid).then(function (error, result) {
                    if (error) {

                        /* aqui solo bd, no llamadas al api */
                        response.status(error.code).json({message: error.message});
                    }

                    else {
                        /* devuelve el objeto token o null*/
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

    var userid= request.params.userid;
    var username = request.body.username;
    var pass = request.body.pass;

    var arrRepos = [];
    var usertoken = "";

    if(userid !== undefined && userid !== null &&
        username !== undefined && username !== null &&
        pass !== undefined && pass !== null ){

        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
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
                        }

                        else{

                            /* puede ser nulo o no */
                            console.log("esto vale result en getusertoken");

                            /* aqui tengo el objeto entero */
                            console.log(result);


                            /* mirar si es nulo, hay que crear el token
                             * */
                            var newResult = {};

                            if(result == null){

                                console.log(" getusertoken:: result es nulo");

                                githubapiservice.createToken(userid,username,pass).then(function (error,result){
                                    if(error){

                                        console.log("error en controller githubapi creando token");
                                        /* viene stringifiao ay que hacer el parse al reves */
                                        var messageJSON= JSON.parse(error.message);
                                        response.status(error.code).json({message: messageJSON.message});
                                    }
                                    else{
                                        /* puede que no haya error pero tampoco token */
                                        /*le avisamos */
                                        if(result == null ){
                                            /* mirar que codigo podemos mandar */
                                            response.json({message: "No se ha conseguido el token, intentelo de nuevo más tarde"});

                                        }
                                        else{

                                            console.log(" createToken:: result no es nulo");

                                            console.log(result);
                                            /* solo el token */
                                            usertoken = result;

                                            /* solo llamada a la bd */
                                            /* hay que guardar el token */
                                            githubapiservice.saveUserToken(userid, username, result).then(function (error,result){
                                                if(error){
                                                    response.status(error.code).json({message: error.message});

                                                }else{


                                                    /* aqui si hay llamada al api */
                                                    /* result:: objto github token dentro (token/username/_id) */
                                                    /* puede ser vacio o null */



                                                    console.log(" saveusertoken en controller:: result no es nulo");


                                                    /* me esta devolviendo otro result*/
                                                    console.log(result);


                                                    if(result !== null){

                                                            console.log(" antes de getrepos en controller:: result vale");

                                                            console.log(result);
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
                                                                                }
                                                                                else {


                                                                                    /* me los devuelve enteros, solo quiero el name y el id
                                                                                     * para angular*/

                                                                                    //newResult.githubtoken = usertoken;
                                                                                    newResult.arrRepos = result;

                                                                                    /* hay que coger los repos asociados */
                                                                                    response.json(newResult);

                                                                                }
                                                                            });




                                                                        }
                                                                        else{


                                                                            newResult.arrRepos = arrRepos;
                                                                            response.json(newResult);
                                                                        }

                                                                    }
                                                                    else{

                                                                        newResult.arrRepos = arrRepos;
                                                                        response.json(newResult);
                                                                    }
                                                                    /* else array vacio */

                                                                }

                                                                else{
                                                                    var messageJSON= JSON.parse(error.message);
                                                                    response.status(error.code).json({message: messageJSON.message});
                                                                }

                                                            }); /* end getrepositories */





                                                    }
                                                    /* no hay token, si lo hay siempre pos de 0 */
                                                    else{
                                                        response.status(422).json({message: "Validation Failed"});

                                                    }

                                                }
                                            }); /* end saveUserToken */


                                        }/* else no hay error pero no hay token */


                                    } /* end else:: no hay error en crear el token */
                                }); /* end create token */


                            } /* end if result es null de getUserToken, aunque no haya error */
                            /* no es nulo, luego existe,
                             * hay que pedir los repos
                             * y mandar respuesta */
                            /* aqui la result es solo el token */
                            else {

                                console.log("en elelse result");
                                console.log(result);


                                /* es el tokengithub con token/username/_id */
                                newResult.githubtoken = result;

                                console.log("esto vale sino es nulo el token");
                                console.log(newResult.githubtoken);


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
                                                    }
                                                    else {

                                                        newResult.arrRepos = result;

                                                        response.json(newResult);


                                                    }
                                                });


                                            }
                                            /* aqui sería vacio */
                                            else{

                                                newResult.arrRepos = arrRepos;
                                                response.json(newResult);
                                            }

                                        }
                                        /* else array vacio */
                                        else{

                                            newResult.arrRepos = arrRepos;
                                            response.json(newResult);

                                        }




                                    }/* si hay error deberiamos notificar??, en este caso si
                                     xq es que tenemos mal las credenciales del usuario, el token que esta guardado en la bd
                                     se esta intentando autenticar y no funciona
                                     */
                                    else{
                                        var messageJSON= JSON.parse(error.message);
                                        response.status(error.code).json({message: messageJSON.message});

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
                }
            }
        });

    }
    else{
        response.status(400).json({message: 'Bad Request. Missing required parameters'});

    }





};


/* con eso valdría */
/*nos tiene que pasar 1 array de repos y el username */
exports.createHooks = function createHooks (request, response) {






    var userid= request.params.userid;
    var username= request.body.username;
    var repositories = request.body.repositories;


    if(userid !== undefined && userid !== null &&
        username !== undefined && username !== null &&
        repositories !== undefined && repositories !== null ){




        var arrRepos = repositories.split(",");
        console.log("esto vale array repos");
        console.log(arrRepos);



        Auth(request, response).then(function (error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
            }
            else {

                if (userid == result._id) {



                    /* lo que devuelve puede ser vacio o nulo, hay que mirarlo en angular */
                    /* no deberia pero si es vacio o nulo, devolvemos error */
                    githubapiservice.getUserToken(userid, username).then(function (error, result) {
                        if (error) {

                            /* aqui solo bd, no llamadas al api */
                            response.status(error.code).json({message: error.message});
                        }

                        else {
                            /*response.json(result);*/
                            /* no hay token y esto no debería pasar,
                             ha tenido que crearlo o guardarlo antes, sino no puede llamar
                             a este metodo */

                            console.log("no hay error creando token ");
                            console.log("esto vale result");
                            console.log(result);

                            if(result == null){

                                /* devolvemos un error */
                                /* de no authorizacion */
                                response.status(400).json({message: "Bad request: no token available"});


                            }
                            /* creamos el hook */
                            else{
                                /* la respuesta es el token: con login y token
                                 * */


                                console.log("result no es null");
                                /* no se que devolver, de momento devolvemos el result entero y luego miramos */
                                /* para los repos que se hayan creado, devolver un OK con parametro de posibles errores */

                                githubapiservice.createHooks(result, arrRepos).then(function (error,result) {
                                    if (error) {




                                        console.log("error en controller githubapi creando hooks");


                                        if(error.message !== undefined || error.message !== null){
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

                                        response.status(error.code).json(error);
                                            /* esto tiene el error */
                                            /* githubMessageErrors.item = item;
                                             githubMessageErrors.code = err.code
                                             githubMessageErrors.message = err.message*/
                                            /* solo mandamos el primer error */





                                    }

                                    else {
                                        /* esto luego hay que cambiarlo para el canal, crearlo y asociarlo */

                                        if(result == null){

                                            /* en este caso no se crearía el canal y se mostraria */
                                            response.status(204).json({message: "No webhooks created"});

                                        }

                                        /* hay que crear el canal y asignar al idgithub los repos
                                         * nunca va a ser nulo yo creo */
                                        else{
                                            response.status(201).json(result);

                                        }




                                    }


                                });

                            }

                        }
                    });


                }

                else{
                    response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});

                }
            }



        });
    }
    else{
        response.status(400).json({message: 'Bad Request. Missing required parameters'});

    }






};









/***************************************************************/
exports.prueba1 = function prueba1 (request, response) {

/*https://github.com/petkaantonov/bluebird/blob/2.x/API.md#all---promise*/

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



    github.authorization.create({
        scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook", "admin:org_hook"],
        note: "what this auth is for",
        note_url: "http://url-to-this-auth-app",
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if (err) {
            console.log("hay erroe en authorization create");
            console.log(err.message);
            /*Object
             message
             :
             "{"message":"Bad credentials",
             "documentation_url":"https://developer.github.com/v3"}*/
            response.status(err.code).json(err.message);
            /* puede petar xq ya este creado */
            /* entonces update */

        }
        else if (res.token) {
            console.log("NO error al en authorizacion al repo?? hook");
            console.log(res.token);

            /* este token abra que guardarlo en el canal*/
            /*response.js

             */
        }
    });




    /* meter esto :: admin:org_hook*/

    /* este es quien me da todos los errores */
    /* si ya esta creado, puedo borrarlo en
     * 1izpena/settings/Personal access token */
    github.authorization.create({
        scopes: ["user", "public_repo", "repo", "repo:status", "gist", "write:repo_hook", "admin:org_hook"],
        note: "what this auth is for",
        note_url: "http://url-to-this-auth-app",
        headers: {
            "X-GitHub-OTP": "two-factor-code"
        }
    }, function(err, res) {
        if(err){
            console.log("hay erroe en authorization create");
            console.log(err.message.message);
            response.status(err.code).json(err.message);
            /* puede petar xq ya este creado */
            /* entonces update */

        }
        else if (res.token) {
            console.log("NO error al en authorizacion al repo?? hook");
            console.log(res.token);

            /* este token abra que guardarlo en el canal*/
            /*response.json(res.token);*/






            /* ahora intentamos crear el hook*/
/*http://stackoverflow.com/questions/25705067/using-async-waterfall-in-node-js*/

            var repo = "ionicProjectDef";
            var repo2 = "ionicProject4";
            var user = config.usernamegithub;
            var array = [];
            array[0]=repo;
            array[1]=repo2;
            var errGithub = false;
            var errGithub2 = "";
            /*http://stackoverflow.com/questions/32126711/asynchronous-function-call-inside-for-loop*/



            async.each(array,
                // 2nd param is the function that each item is passed to
                function(item, callback){
                    // Call an asynchronous function,
                    github.repos.createHook({

                        user: user,
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
                            console.log(err);
                            errGithub = true;
                        }
                        callback(); //required
                    });
                },

                // 3rd param is the function to call when everything's done
                function(err){

                    if(err){
                        console.log('Error:' + err);
                    }

                    // All tasks are done now
                    if(errGithub ===true){
                        response.status(404).json(err);
                    }else{
                        response.json({message:"OK"});
                    }
                }
            );

            /* quiero probar si se pueden hacer varios ala vez */
            /* desde el cliente hago 2 peticiones, si las 2 son validas
            * le dejamos, y sino */

            /*

            array.forEach(function(value) {


                github.repos.createHook({

                    user: user,
                    repo: value,
                    name: "web",
                    config: {
                        /* esto sera mio propio *
                        url: "http://9ec2067d.ngrok.io/api/v1/callback",
                        content_type: "json"
                    },
                    events: ["*"],
                    active: true,

                    headers: {
                        "X-GitHub-OTP": "two-factor-code"
                    }


                }, function (err, res) {
                    if (err) {
                        console.log("error al crear hook");
                        console.log(err);
                        errGithub = true;
                        errGithub2 = err;
                        //response.status(404).json(err);


                    }
                    else {
                        if (i == array.length && !errGithub) {


                            //response.json({message:"OK"});

                        }
                        console.log("esto vale resen create hook");
                        console.log(res);
                    }


                    //fn(doneTask, value);
                });
            });

            if(errGithub){
                response.status(404).json(errGithub2);


            }else{
                response.json({message:"OK"});

            }


*/



            /**
            for(var i = 0; i<array.length; i++){

                github.repos.createHook({

                    user: user,
                    repo: array[i],
                    name: "web",
                    config: {
                        /* esto sera mio propio *
                        url: "http://9ec2067d.ngrok.io/api/v1/callback",
                        content_type: "json"
                    },
                    events: ["*"],
                    active:true,

                    headers: {
                        "X-GitHub-OTP": "two-factor-code"
                    }






                }, function(err, res) {
                    if (err) {
                        console.log("error al crear hook");
                        console.log(err);
                        errGithub = true;
                        response.status(404).json(err);


                    }
                    else {
                        if(i==array.length && !errGithub){


                            response.json({message:"OK"});

                        }
                        console.log("esto vale resen create hook");
                        console.log(res);
                    }
                });



            }
*/









        }/* end no hay error y hay token */
        /* en el else no hay error pero no hay token */
        else{

            /* este token hay que guardarlo en la bd, en el canal */
            console.log("esto no debería pasar ");
            console.log(res);
            response.status(404).json({message: 'Error in authorized.'});




        }
    });

}


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
            url: config.githubcallback,
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
