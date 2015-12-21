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









