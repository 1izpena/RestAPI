var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var Hope  = require('hope');
var mongoose = require('mongoose');
var chatErrors  = require('../helpers/chatErrorsHandler');
var channelservice  = require('../services/channel');

exports.updateuserchannelprivatelist = function updateuserchannelprivatelist(userid,groupid,channelid){
    var promise = new Hope.Promise();
    User.findOne({ _id: userid}).populate('groups._group').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else if (user){
            var listaGrupos = user.groups;
            for (i=0;i<listaGrupos.length;i++){
                if (groupid == listaGrupos[i]._group._id){
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

exports.createnewchannel = function createnewchannel(ats,userid,groupid,channelName,channelType){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');

    chatErrors.chechchannelnameunique(userid,groupid,channelName,channelType).then(function (error,result){
        if (error){
            return promise.done(error,null);
        }else {
            Channel.createchannel (ats,userid,groupid).then(function createchannel (error, result){
                if (error){
                    return promise.done(error,null);
                } else {
                    var channelid = result._id;
                    var channel = result;
                    if (channelType == "PRIVATE"){
                        channelservice.updateuserchannelprivatelist(userid,groupid, result._id).then(function(error,result){
                            if (error){
                                return promise.done(error,null);
                            }
                        });
                    }
                    return promise.done(null,channel);
                }
            });
        }
    });
    return promise;
};







