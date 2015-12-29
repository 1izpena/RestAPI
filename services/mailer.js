var nodemailer = require('nodemailer');


exports.check = function check(request, response){

//email, username, token
//validar si hace falta -- if( /(.+)@(.+){2,}\.(.+){2,}/.test(email) ){
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
	auth: {
	  user: "dessimailer@gmail.com",
	  pass: "dessimailer!"
	 }
  	});


switch(request.action){

		case 0:

		var html = "<img src='http://www.investrade.com/gunnallen/images/activate.png' style='width:200px;height:128px;'><br/>"+
    	"<p>Para activar tu cuenta accede a <a href='http://localhost:9000/#/activate/"+request.token+"'>activar</a></p>";
    	var subject = "Activa tu cuenta";

    	break;

    	case 1:

    	var html = "<img src='http://squares.thinkcommand.com/images/forgot_pass/ForgotPasswordIcon.png' style='width:128px;height:128px;'><br/>"+
    	"<p>Para resetear tu pass accede a <a href='http://localhost:9000/#/reset/"+request.token+"'>RESETEO</a></p>";
    	var subject = "Resetear contraseña";

    	break;

    	case 2:

    	var html = "Hola " + request.username +" !! Tu contraseña ha sido reseteada"+
		"<a href='http://localhost:9000/#/login/'>Login</a>"; 
		var subject = "Contraseña reseteada";

		break;

		default:
			console.log("error template email");

}


	

  var mailOptions = {
    from: "Dessi2015", 
	to: request.mail, 
	subject: subject, 
	html: html
  }
				    
  smtpTransport.sendMail(mailOptions, function(error, result){
    if(error){
    response({message:"error"});    	
	}else{
	 	response({message:"ok"});
	}

  });	
}






