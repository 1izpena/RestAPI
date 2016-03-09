  'use strict';

var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var Token = require('../helpers/token');
var mail  =require('../services/mailer');
var LoginErrorsHandler = require('../helpers/loginErrorsHandler');
  var URLService = require('../services/url');


 /* var oembed = require('oembed-auto');
  var MetaInspector = require('node-metainspector');*/



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
                              response.status(404).json(error);
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



  /*


   exports.userplaylist = function userplaylist (req, res) {

   console.log("entro en userplaylist");
   console.log("esto vale url");
   console.log(req.body.data);

   Auth(req, res).then(function(error, result) {
   if (error) {
   response.status(error.code).json({message: error.message});

   } else {

   var url = req.body.data;


   var client = new MetaInspector(url, { timeout: 5000 });

   oembed(url, function(error, result) {

   if (error){
   console.log("entro en error");
   console.log(error);

   client.fetch();
   }

   else{
   console.log("entro en NO error");
   console.log(result);


   /* si la result es de tipo link, hacemos con la otra librería *
  if(result.type == 'link' || typeof (result.type) == 'undefined'){
      client.fetch();
  }
  else {
      console.log("esto vale oembed: video,audio, rich..");
      console.log(result);
      res.json(result);

  }


  }

  });


  client.on("fetch", function(){

      var metatags = {
          host: client.host,
          title: client.title,
          description: client.description,
          author: client.author,
          keywords: client.keywords,
          image: client.image
      };


      res.json(metatags);


  });

  client.on("error", function(err){
      console.log(err);
      res.status(404).json({message: err.message});
  });


  }/* end else if(error) *
  });

  };




   */





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
