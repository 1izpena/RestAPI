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



  exports.callback2 = function callback2 (request, response) {
      console.log("esto valeresponseee callback2");
        console.log(response);
      response.json({message: 'Fu4ciona2.'});
  };

  exports.callback3 = function callback3 (request, response) {
      console.log("esto valeresponseee callback3");
      console.log(response);

      response.json({message: 'Fu4ciona3****.'});
  };



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

      /*
      github.repos.createHook({

          user: user,
          repo: repo,
          name: "web",
          config: {
              url: "http://9c0cbf31.ngrok.io/api/v1/callback",
              content_type: "json"
          },
          /* secret: res.token,*
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


    github.authenticate({
        type: "basic",
        username: config.usernamegithub,
        password: config.passgithub
    });



    /**
    github.authenticate({
        type: "oauth",
        key: config.CLIENT_ID,
        secret: config.CLIENT_SECRET
    });
**/

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
            response.json(res.token.parse());

            /* ahora se autentifica asi
            *
            * github.authenticate({
             type: "token",
             token: token
             });
            *
            *
            * */

        }
        else{


                console.log("hay erroe en authorization create en response ");
                console.log(res);
            response.status(404).json({message: 'Error in authorized.'});


            /*ya tengo el token */
            /* 32631cf7a674463b04433d496d2a04933caa2eb8
             */


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

/*




   /* Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});

        } else {

            var limit = request.query.limit;
            var page = request.query.page;


            var filter = {active: true};
            User.search(filter, limit, page).then(function(error, user) {
                if (user === null) {
                    response.status(400).json({message: 'User not found.'});

                } else {

                    response.json(user);
                }
            })
        }
    })*/
};







  /********* end new ******/

exports.signup = function signup (request, response) {

  User.signup(request.body).then(function signup (error, result) {

    if (error) {

      response.status(error.code).json({message: error.message});
    } else {

      var token = Token(result);
      //request.session.user = token;
      result.token = token;
      //response.json(result.parse());

      // Mail activación//
      result.action=0;
      mail.check(result,function(res){
      if(res.message=="ok"){
      response.json(token);
       }else{
      response.json(res.message);
       }
      });
    }
  });
};


exports.login = function login (request, response) {
    var loginerrorshandler = LoginErrorsHandler(request.body);

    if (loginerrorshandler) {
	response.status(loginerrorshandler.code).json({message: loginerrorshandler.message});
    }
    else {

	User.login(request.body).then(function login (error, result) {

	  if (error) {
       //mail Activacion
      if (error.code==401){
      var user = error.user;
      var token = Token(user);
      user.token = token;
      user.action=0;

      mail.check(user,function(res){
      if(res.message=="ok"){
      response.status(error.code).json({message: error.message, token: token});
       }else{
      console.log("fallo envio mail activacion a " + user.mail);
       }
      });
       }else{
       response.status(error.code).json({message: error.message});
        }
	  } else {
	      var token = Token(result);
	      //request.session.user = token;
	      var user = result.parse();
	      user.token = token;
	      response.json(user);
	    }
  	});

   }
};


/* http://localhost:3000/api/v1/users?limit=6&page=0 */
exports.userlist = function userlist (request, response) {

  Auth(request, response).then(function(error, result) {
    if (error) {
      response.status(error.code).json({message: error.message});

    } else {

          var limit = request.query.limit;
          var page = request.query.page;


          var filter = {active: true};
	  User.search(filter, limit, page).then(function(error, user) {
			if (user === null) {
			    response.status(400).json({message: 'User not found.'});

			} else {

			    response.json(user);
			}
	  })
    }
  })
};


  exports.userplaylist = function userplaylist (req, res) {

      console.log("entro en userplaylist");
      console.log("esto vale url");
      console.log(req.body.data);

      Auth(req, res).then(function(error, result) {
          if (error) {
              res.status(error.code).json({message: error.message});

          } else {

              var url = req.body.data;
              if (!url) {
                  res.status(400).json({message: "URL required"});
              }
              else {
                  URLService.getMetaTags(url)
                      .then(function (error,result) {
                          if (error) {
                              res.status(404).json(error);
                          }
                          else {
                              console.log("esto me devuelve el servicio url");
                              console.log(result);
                              res.json(result);
                          }
                      });

              }


          }/* end else if(error) */
      });

  };



/* 1. Mira si esta logeado */
/* 2. Coge el id de la url y devuelve el user */
exports.publicprofile = function profile (request, response) {

  Auth(request, response).then(function(error, result) {
    if (error) {
      response.status(error.code).json({message: error.message});

    } else {

          var filter = { _id: request.params.userid };
	  User.search(filter, 1).then(function(error, user) {
			if (user === null) {
			    response.status(400).json({message: 'User not found.'});

			} else {
			    response.json(user.parse());
			}
	  })
    }
  })
};

//user 1: 5665ab58973e2bde19be5269
//user 2: 5665b8f739c92cae1a6d3b7b
/* 1. Mira si esta logeado */
/* 2. Coge el id de la url y devuelve el user */
/* 3. Si es private mira que coincida token y el userid de la url */
exports.privateprofile = function profile (request, response) {

  Auth(request, response).then(function(error, result) {
    if (error) {
      response.status(error.code).json({message: error.message});

    } else {
      	  if ( request.params.userid == result._id){

                var filter = { _id: request.params.userid };
	        User.search(filter, 1).then(function(error, user) {
			if (user === null) {
			    response.status(400).json({message: 'User not found.'});

			} else {
			    response.json(user.parse());
			}
	        })

	  } else {
		response.status(401).json({message: 'Unauthorized. The private profile that you are trying access is not yours'});

	  } /* else ::permision denied */

    } /* else:: not error */


  });/* end Auth promise */
}; /* end privateprofile */



exports.forget = function forget(request, response){
 User.search(request.body,1).then (function search(error, result){
  if(error){
    response.status(error.code).json({message: error.message});
  }
  else {
    /*Envio de mail y token*/
    var token = Token(result);
    result.token=token;

    if(result.active==true){
   result.action=1;
    mail.check(result,function(res){
      if(res.message=="ok"){
      response.json(token);
       }else{
      response.json(res.message);
       }
      });

    }else{

   result.action=3;
    mail.check(result,function(res){
      if(res.message=="ok"){
      response.json(token);
       }else{
      response.json(res.message);
       }
      });
    }

    }});
  };

exports.reset = function reset(request, response){

 Auth(request, response).then(function(error, result) {
    if (error) {
  /* nunca va a entrar */
      response.status(error.code).json({message: error.message});
    } else
    {
      result.newPass= request.body.password;
      User.reset(result);
      response.json({message:"successfully"});

      //solo ínforma del cambio de pass
       result.action=2;
      mail.check(result,function(res){
       });
    }});
};

exports.activate = function activate(request, response){

 Auth(request, response).then(function(error, result) {
    if (error) {
      response.status(error.code).json({message: error.message});
    } else
    {
      User.activate(result);
      response.json({message:"Cuenta activada"});

    }});
};

//ELIMINAR CUENTA
exports.remove = function remove(request, response){

 Auth(request, response).then(function(error, result) {
    if (error) {
      response.status(error.code).json({message: error.message});
    } else
    {
      User.remove(result);
      response.json({message:"Cuenta eliminada"});

    }});
};

exports.social = function social (request, response) {

          request.body.password = "0000000"; //temporal

    User.social(request.body).then(function social (error, result) {
    if (error) {
      response.status(error.code).json({message: error.message});
    } else {
      var token = Token(result);
      response.json({token: token,
                    mail: result.mail,
                    username: result.username,
                    id: result.id
                  });
    }
  });
};
