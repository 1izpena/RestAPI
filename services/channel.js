var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var Hope  = require('hope');
var mongoose = require('mongoose');

exports.obtaingroupid = function obtaingroupid(userid,groupname){
    var promise = new Hope.Promise();
    User.findOne({ _id: userid}).populate('groups._group').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else if (user){
            var listaGrupos = [];
            listaGrupos = user.groups;
            for (i=0;i<listaGrupos.length;i++){
                if (listaGrupos[i]._group.groupName === groupname){
                    var vuelta = listaGrupos[i]._group._id;
                    promise.done(null, vuelta);
                }
            }
        }
    });
    return promise;
};

exports.updateuserchannelprivatelist = function updateuserchannelprivatelist(userid,groupid,channelid){
    var promise = new Hope.Promise();
    User.findOne({ _id: userid}).populate('groups._group').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else if (user){
            var listaGrupos = [];
            listaGrupos = user.groups;
            for (i=0;i<user.groups.length;i++){
                if (user.groups[i]._group._id === groupid){
                    user.groups[i]._group.privateChannels.push(channelid);
                }
            }

            var update = '';
            update = {"groups":user.groups};

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
                        message: 'user already has the channel name'
                    };
                    return promise.done(err, null);
                }else {
                    return promise.done(null, group);
                }
            }
        });
    }if (channeltype == "PRIVATE"){
        console.log("El canal es privado");
        User.findOne({ _id: userid}).populate('groups._group groups.privateChannels').exec(function (error, user) {
            if (error){
                return promise.done(error,null);
            }
            else if (user){
                var encontrado=false;
                var listaGrupos = user.groups;
                for (i=0;i<listaGrupos.length;i++){
                    if (listaGrupos[i]._group._id === groupid){
                        console.log("son iguales");
                        for (j=0;j<listaGrupos[i].privateChannels.length;j++){
                            console.log ("channelname de su lista: " + listaGrupos[i].privateChannels[j].channelName);
                            if (listaGrupos[i].privateChannels[j].channelName === channelname){
                                encontrado = true;
                            }
                        }
                    }
                }
                if (encontrado === true){
                    console.log ("si encontrado");
                    var err = {
                        code   : 403,
                        message: 'user already has the channel name'
                    };
                    return promise.done(err, null);
                }else {
                    return promise.done(null, user);
                }
            }
        });
    }

    return promise;
};







