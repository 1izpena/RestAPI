/**
 * Created by izaskun on 31/03/16.
 */

'use strict';

/*
var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var Token = require('../helpers/token');
var mail  =require('../services/mailer');
var LoginErrorsHandler = require('../helpers/loginErrorsHandler');
var URLService = require('../services/url');
*/



/****** new ******/
var config = require('../config');
var githubHandler = require('../helpers/githubHandler');


/* var GitHubApi = require("github"); */



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
                    console.log(message4.commits)
                    console.log("como string");
                    console.log(JSON.stringify(message4));
                }



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




