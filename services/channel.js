var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var Hope  = require('hope');
var mongoose = require('mongoose');


exports.updateuserchannelprivatelist = function updateuserchannelprivatelist(userid,groupid,channelid){
    var promise = new Hope.Promise();
    User.findOne({ _id: userid}).populate('groups._group').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else if (user){
            var listaGrupos = user.groups;
            for (i=0;i<listaGrupos.length;i++){
                if (groupid.equals(listaGrupos[i]._group._id)){
                    listaGrupos[i].privateChannels.push(channelid);
                }
            }
            var update = {"groups":listaGrupos};
            var options = {multi: true};
            User.updateuser(userid,update,options).then(function updateuser (error){
                if(error){
                    return promise.done(error,null);
                }else{
                    promise.done(null,user);
                }
            });
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
                    if (channelname === canales[i].channelName){
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
                    if (channelname === canales[i].channelName){
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







