
var nodevalida	= require('validator');




module.exports = function(parameters) {

  var error = null;
  
  if (nodevalida.isNull(parameters.mail)){
     error = {
        code: 403,
        message: "Mail is required."
      };  

  }
  else if (nodevalida.isNull(parameters.password)){
     error = {
        code: 403,
        message: "Password is required."
      };
   

  }
  else if (!nodevalida.isEmail(parameters.mail)){
     error = {
        code: 403,
        message: "Mail format is invalid."
      };   

  }
  
  return error;

}
