var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');

exports.checktoken = function(parameters) {
    var error = null;
    var token = parameters.body.token || parameters.query.token || parameters.headers['x-access-token'];
    if (token != null && token!=undefined){
        console.log ("Llega token");
    } else {
        console.log ("No llega token");
        error = {
            code: 403,
            message: "Token required on header"
        };
    }
    return error;
};

exports.checkgroupnameunique = function checkgroupnameunique(userid,groupname){
    var err = null;
    User.findOne({ _id: userid}).populate('groups').exec(function (error, user) {
        if (user){
            var listaGrupos = [];
            listaGrupos = user.groups;
            var encontrado = false;
            for (i=0;i<listaGrupos.length;i++){
                if (listaGrupos[i].groupName == groupname){
                    encontrado = true;
                    break;
                }
            }
           if (encontrado) {
               err = {
                   code: 403,
                   message: "User already has a group with that name"
               };
           }
        }else if (error) {
             err = {
                 code: error.code,
                 message: error.message
             }
        }
    });
    return err;
};

exports.checkchannelnameunique = function checkchannelnameunique(userid,groupname,channelName){
    var err = '';
    var vuelta = '';
    Group.findOne({ groupName: groupname}).populate('channels').exec(function (error, group) {
        if (group){
            vuelta = {
               error: null,
               groupid: group._id
            };
            console.log ("Grupos del usuario...: " + group.channels);
            var listaGrupos = [];
            listaGrupos = group.channels;
            var encontrado = false;
            for (i=0;i<listaGrupos.length;i++){
                if (listaGrupos[i].channelName == channelName){
                    encontrado = true;
                    break;
                }
            }
            if (encontrado) {
                err = {
                    code: 403,
                    message: "User already has a channel with the same name"
                };
                vuelta = {
                    error: err,
                    groupid: group._id
                };
            }
        }else if (error) {
            err = {
                code: error.code,
                message: error.message
            };
            vuelta = {
                error: err,
                groupid: group._id
            };
        }
    });
    return vuelta;
};






