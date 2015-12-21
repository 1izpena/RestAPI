var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');

exports.checktoken = function(parameters) {
    var error = null;
    var token = parameters.body.token || parameters.query.token || parameters.headers['x-access-token'];
    if (token != null && token!=undefined){
        console.log ("Llega token");
    } else {
        error = {
            code: 403,
            message: "Token required on header"
        };
    }
    return error;
};

