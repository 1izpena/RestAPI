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

		var html = "<img src='http://i66.tinypic.com/1z2m64k.png' style='width:350px;height:128px;'><br/>"+
    	"<p style='color:#163B5A;'>To activate your account follow the link  <a href='http://localhost:9000/#/activate/"+request.token+"'>activate</a></p>";
    	var subject = "Meanstack activate account";

    	break;

    	case 1:

    	var html = "<img src='http://i66.tinypic.com/1z2m64k.png' style='width:350px;height:128px;'><br/>"+
    	"<p style='color:#163B5A;'>To restart your password follow the link <a href='http://localhost:9000/#/reset/"+request.token+"'>Restart Pass</a></p>";
    	var subject = "Meanstack restart password";

    	break;

    	case 2:

    	var html = "<img src='http://i66.tinypic.com/1z2m64k.png' style='width:350px;height:128px;'><br/>"+
      "<p style='color:#163B5A;'> Hi " + request.username +" !! your password has been restarted"+
		"<a href='http://localhost:9000/#/login/'>Login</a>";
		var subject = "Meanstack password restarted";

		break;

        case 3:

    var html = "<img src='http://i66.tinypic.com/1z2m64k.png' style='width:350px;height:128px;'><br/>"+
      "<p style='color:#163B5A;'>Before you restart your password you must activate it<a href='http://localhost:9000/#/activate/"+request.token+"'>activate</a></p>";
      var subject = "Meanstack activate account";

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
