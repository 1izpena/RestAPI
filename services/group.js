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
            var listaGrupos = [];
            var encontrado=false;
            listaGrupos = user.groups;
            for (i=0;i<listaGrupos.length;i++){
                if (listaGrupos[i]._group.groupName === groupname){
                    encontrado = true;
                }
            }
            if (encontrado === true){
                console.log ("si encontrado");
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

exports.getgrouplist = function getgrouplist(userid){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    User.findOne({ _id: userid}).populate('groups._group').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else if (user){
            promise.done(null,user.groups);
        }
    });
    return promise;
};

exports.getinfo = function getinfo(groupid){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else if (group){
            promise.done(null, group.parse());
        }
    });
    return promise;
};

exports.obtaingroupid = function obtaingroupid(userid,groupname){
    var promise = new Hope.Promise();
    var User = mongoose.model('User');
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










