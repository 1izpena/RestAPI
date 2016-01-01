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

exports.updatechanneluserlist = function updatechanneluserlist(userid,channelid){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var options = { new: true};
    var updateQuery = { $push: { "users": userid} };
    Channel.updatechannel (channelid,updateQuery,options).then (function (error,channel) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, channel);
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
                    if (channelType == "PRIVATE"){
                        channelservice.updateuserchannelprivatelist(userid,groupid, result._id).then(function(error,result){
                            if (error){
                                return promise.done(error,null);
                            }
                            else {
                                channelservice.updatechanneluserlist(userid, channelid).then(function(error,result){
                                    if (error){
                                        return promise.done(error,null);
                                    }
                                    else {
                                        return promise.done(null,result);
                                    }
                                });
                            }
                        });
                    }

                }
            });
        }
    });
    return promise;
};

exports.getuserlist = function getuserlist(channelid){
    var User = mongoose.model('User');
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();
    Channel.findOne({_id: channelid}).populate('users').exec(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else{
            if (channel){
                var vuelta = [];
                for (i=0;i<channel.users.length;i++){
                    var elto = {
                        id        : channel.users[i]._id,
                        username  : channel.users[i].username,
                        mail      :channel.users[i].mail
                    };
                    vuelta.push(elto);
                }
                promise.done(null,vuelta);
            } else {
                var err = {
                    code   : 403,
                    message: 'group not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

exports.getchannellist = function getchannellist(groupid,userid){
    var User = mongoose.model('User');
    var Channel = mongoose.model('Channel');
    var Group = mongoose.model('Group');
    var promise = new Hope.Promise();
    Group.findOne({_id: groupid}).populate('channels').exec(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else{
            if (group){
                var publicos = [];
                var privados = [];
                for (i=0;i<group.channels.length;i++){
                    if (group.channels[i].channelType == "PUBLIC" ){
                        var elto = {
                            id        : group.channels[i]._id,
                            channelName  : group.channels[i].channelName
                        };
                        publicos.push(elto);
                    }else {
                        var encontrado = false;
                        var j = 0;
                        while (encontrado == false && j<group.channels[i].users.length){
                            if (userid == group.channels[i].users[j]){
                                var elto2 = {
                                    id        : group.channels[i]._id,
                                    channelName  : group.channels[i].channelName
                                };
                                privados.push(elto2);
                                encontrado = true;
                            }
                            j++;
                        }
                    }

                }
                var vuelta = {
                  publicChannels: publicos,
                  privateChannels: privados
                };
                promise.done(null,vuelta);
            } else {
                var err = {
                    code   : 403,
                    message: 'group not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

exports.adduser = function adduser(groupid,userid,channelid){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var User = mongoose.model('User');
    var Channel = mongoose.model('Channel');
    var options = { new: true};
    var updateQuery = { $push: { "users": userid} };
    channelservice.updateuserchannelprivatelist(userid,groupid, channelid).then(function(error,result){
        if (error){
            return promise.done(error,null);
        }
        else {
            channelservice.updatechanneluserlist(userid, channelid).then(function(error,result){
                if (error){
                    return promise.done(error,null);
                }
                else {
                    return promise.done(null,result);
                }
            });
        }
    });
    return promise;
};

exports.deleteuser = function deleteuser(groupid,userid,channelid){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var User = mongoose.model('User');
    var Channel = mongoose.model('Channel');
    var query = {_id: channelid};
    var limit = 1;
    Channel.search(query,limit).then(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (channel){
                var encontrado = false;
                var i = 0;
                while (encontrado == false && i<channel.users.length){
                    if (channel.users[i] == userid){
                        channel.users.splice(i,1);
                        encontrado = true;
                    }
                    i++;
                }
                var query = {users: channel.users};
                var options = {new:true};
                Channel.updatechannel(channelid,query,options).then(function (error, result){
                    if (error){
                        return promise.done(error,null);
                    }
                    else{
                        var channel = result;
                        User.findOne({ _id: userid}).populate('groups._group').exec(function (error, user) {
                            if (error){
                                return promise.done(error,null);
                            }
                            else {
                                if (user){
                                    var listaGrupos = user.groups;
                                    for (j=0;j<listaGrupos.length;j++){
                                        if (groupid == listaGrupos[j]._group._id){
                                            listaGrupos[j].privateChannels.splice(j,1);
                                        }
                                    }
                                    var update = {"groups":listaGrupos};
                                    var options = {multi: true};
                                    User.updateuser(userid,update,options).then(function updateuser (error){
                                        if(error){
                                            return promise.done(error,null);
                                        }else{
                                            promise.done(null,channel);
                                        }
                                    });
                                }
                                else {
                                    var err = {
                                        code   : 403,
                                        message: 'user not found'
                                    };
                                    return promise.done(err, null);
                                }
                            }

                        });
                    }
                });

            }else {
                var err = {
                    code   : 403,
                    message: 'channel not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};





