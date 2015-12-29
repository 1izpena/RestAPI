  'use strict';

var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var Token = require('../helpers/token');
var mail  =require('../services/mailer');
var LoginErrorsHandler = require('../helpers/loginErrorsHandler');

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




exports.profile = function profile (request, response) {
  Auth(request, response).then(function(error, result) {
    if (error) {
	/* nunca va a entrar */
      response.status(error.code).json({message: error.message});
    } else {
	/* devuelve el usuario entero */
      response.json(result.parse());
    }
  })
};

exports.forget = function forget(request, response){
 User.search(request.body,1).then (function search(error, result){
  if(error){
    response.status(error.code).json({message: error.message});
  } 
  else {
    /*Envio de mail y token*/
    var token = Token(result);
    result.token=token;
    
   result.action=1;
    mail.check(result,function(res){
      if(res.message=="ok"){
      response.json(token);         
       }else{
      response.json(res.message);
       }
      });      
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
      response.json({message:"Contraseña cambiada con éxito"});

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
