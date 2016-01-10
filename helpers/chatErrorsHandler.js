var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var mongoose = require('mongoose');
var Hope  = require('hope');

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
                    code   : 401,
                    message: 'The user already has a group with that name'
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
        Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
            if (error){
                return promise.done(error,null);
            }
            else if (group){
                var i=0;
                var encontrado = false;
                var canales = group.channels;
                while (encontrado === false && i<canales.length){
                    if (channelname === canales[i].channelName && canales[i].channelType=="PUBLIC"){
                        encontrado = true;
                    }
                    i++;
                }
                if (encontrado === true){
                    var err = {
                        code   : 401,
                        message: 'the group already has a public channel with that name'
                    };
                    return promise.done(err, null);
                }else {
                    return promise.done(null, group);
                }
            }
        });
    }if (channeltype == "PRIVATE"){
        Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
            if (error){
                return promise.done(error,null);
            }
            else if (group){
                var i = 0;
                var encontrado = false;
                var canales = group.channels;
                while (encontrado === false && i<canales.length){
                    if (channelname === canales[i].channelName && canales[i].channelType=="PRIVATE"){
                        encontrado = true;
                    }
                    i++;
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
    } if (channeltype == "DIRECT"){
        Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
            if (error){
                return promise.done(error,null);
            }
            else if (group){
                var i = 0;
                var encontrado = false;
                var canales = group.channels;
                while (encontrado === false && i<canales.length){
                    if (channelname === canales[i].channelName && canales[i].channelType=="DIRECT"){
                        encontrado = true;
                    }
                    i++;
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

exports.checkisgroupadmin = function(groupid,userid) {
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var query = {_id: groupid};
    var limit = 1;
    Group.search(query,limit).then(function (error, group) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (group){
                if (userid == group._admin){
                    return promise.done(null, group);
                }else {
                    var err = {
                        code   : 401,
                        message: 'you are not the admin of the group'
                    };
                    return promise.done(err, null);
                }
            }else {
                var err = {
                    code   : 401,
                    message: 'group not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

