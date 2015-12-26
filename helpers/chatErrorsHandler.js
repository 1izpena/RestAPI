var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var mongoose = require('mongoose');
var Hope  = require('hope');

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

exports.checkgroupnameunique = function checkgroupnameunique(userid,groupname){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    User.findOne({ _id: userid}).populate('groups._group').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else if (user){
            var encontrado = false;
            var i = 0;
            var listaGrupos = user.groups;
            while (encontrado === false && i<listaGrupos.length){
                if (listaGrupos[i]._group.groupName === groupname){
                    encontrado = true;
                }
                i++;
            }
            if (encontrado === true){
                var err = {
                    code   : 403,
                    message: 'user already has the group name'
                };
                return promise.done(err, null);
            }else {
                return promise.done(null, user);
            }
        }
    });
    return promise;
};

exports.chechchannelnameunique = function chechchannelnameunique(userid,groupid,channelname,channeltype){
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();
    if (channeltype == "PUBLIC"){
        console.log("El canal es publico");
        Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
            if (error){
                return promise.done(error,null);
            }
            else if (group){
                var encontrado = false;
                var canales = group.channels;
                for (i=0;i<group.channels.length;i++){
                    if (channelname === canales[i].channelName && canales[i].channelType=="PUBLIC"){
                        encontrado = true;
                    }
                }
                if (encontrado === true){
                    console.log ("si encontrado");
                    var err = {
                        code   : 403,
                        message: 'the group already has a public channel with that name'
                    };
                    return promise.done(err, null);
                }else {
                    return promise.done(null, group);
                }
            }
        });
    }if (channeltype == "PRIVATE"){
        console.log("El canal es privado");
        Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
            if (error){
                return promise.done(error,null);
            }
            else if (group){
                var encontrado = false;
                var canales = group.channels;
                for (i=0;i<group.channels.length;i++){
                    if (channelname === canales[i].channelName && canales[i].channelType=="PRIVATE"){
                        encontrado = true;
                    }
                }
                if (encontrado === true){
                    console.log ("si encontrado");
                    var err = {
                        code   : 403,
                        message: 'the group already has a private channel with that name'
                    };
                    return promise.done(err, null);
                }else {
                    return promise.done(null, group);
                }
            }
        });
    }

    return promise;
};

