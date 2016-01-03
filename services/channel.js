var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var Hope  = require('hope');
var mongoose = require('mongoose');
var chatErrors  = require('../helpers/chatErrorsHandler');
var channelservice  = require('../services/channel');

exports.updateuserchannellist = function updateuserchannellist(userid,groupid,channelid,channelType){
    var promise = new Hope.Promise();
    var User = mongoose.model('User');
    var query = { _id: userid};
    var populate = 'groups._group';
    User.searchpopulated(query,populate).then(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (channelType == "PRIVATE"){
                var listaGrupos = user.groups;
                var encontrado = false;
                var i = 0;
                while (encontrado === false && i<user.groups.length){
                    if (groupid == listaGrupos[i]._group._id){
                        {
                            listaGrupos[i].privateChannels.push(channelid);
                            encontrado = true;
                        }
                    }
                    i++;
                }
                var update = {"groups":listaGrupos};
                var options = {multi: true};
                User.updateuser(userid,update,options).then(function (error,user){
                    if(error){
                        return promise.done(error,null);
                    }else{
                        promise.done(null,user);
                    }
                });
            }
        }
    });
    return promise;
};

exports.updatechanneluserlist = function updatechanneluserlist(userid,channelid){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var options = { new: true};
    var updateQuery = {$push: {"users": userid}};
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

exports.createnewchannel = function createnewchannel(userid,groupid,channelName,channelType){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    chatErrors.chechchannelnameunique(userid,groupid,channelName,channelType).then(function (error,result){
        if (error){
            return promise.done(error,null);
        }else {
            var users = [userid];
            var ats = {
                channelName: channelName,
                channelType: channelType,
                users: users,
                group: groupid
            };
            Channel.createchannel (ats).then(function (error, result){
                if (error){
                    return promise.done(error,null);
                } else {
                    var channel = result;
                    var updateQuery = { $push: { channels: channel.id} };
                    var options = {new: true};
                    Group.updategroup(groupid,updateQuery,options).then(function (error){
                        if(error){
                            return promise.done(error,null);
                        }else{
                            if (channelType == "PRIVATE"){
                                channelservice.updateuserchannellist(userid,groupid, result._id,channelType).then(function(error,result){
                                    if (error){
                                        return promise.done(error,null);
                                    }
                                    else {
                                        return promise.done(error, channel);
                                    }
                                });
                            } else {
                                return promise.done(error, channel);
                            }
                        }
                    });
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
    var query = {_id: channelid};
    var populate = 'users';
    Channel.searchpopulated(query,populate).then(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else{
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
        }
    });
    return promise;
};

exports.getchannellist = function getchannellist(groupid,userid){
    var User = mongoose.model('User');
    var Channel = mongoose.model('Channel');
    var Group = mongoose.model('Group');
    var promise = new Hope.Promise();
    var query = {_id: groupid};
    var populate = 'channels';
    Group.searchpopulated(query,populate).then(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else{
            var publicos = [];
            var privados = [];
            for (i=0;i<group.channels.length;i++){
                var encontrado = false;
                var j = 0;
                while (encontrado == false && j<group.channels[i].users.length){
                    if (userid == group.channels[i].users[j]){
                        var elto = {
                            id        : group.channels[i]._id,
                            channelName  : group.channels[i].channelName
                        };
                        if (group.channels[i].channelType == "PUBLIC" ){
                            publicos.push(elto);
                        }else {
                            privados.push(elto);
                        }
                        encontrado = true;
                    }
                    j++;
                }
            }
            var vuelta = {
                publicChannels: publicos,
                privateChannels: privados
            };
            promise.done(null,vuelta);
        }
    });
    return promise;
};

exports.adduser = function adduser(groupid,userid,channelid){
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
                var options = {new: true};
                var updateQuery = {$push:{"users":userid}};
                channelservice.updateuserchannellist(userid,groupid, channelid,channel.channelType).then(function(error,result){
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
                var channelType = channel.channelType;
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
                        var query = { _id: userid};
                        var populate = 'groups._group';
                        User.searchpopulated(query,populate).then(function (error, user) {
                            if (error){
                                return promise.done(error,null);
                            }
                            else {
                                var listaGrupos = user.groups;
                                var encontrado = false;
                                var j = 0;
                                while (encontrado == false && j<j<listaGrupos.length){
                                    if (groupid == listaGrupos[j]._group._id){
                                        if (channelType == "PRIVATE"){
                                            for (k=0;k<listaGrupos[j].privateChannels.length;k++){
                                                if (channelid == listaGrupos[j].privateChannels[k]){
                                                    listaGrupos[j].privateChannels.splice(k,1);
                                                    encontrado = true;
                                                }
                                            }
                                        }

                                    }
                                    j++;
                                }
                                if (encontrado == true){
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

exports.updatechannelname = function updatechannelname(channelid,channelName){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var options = {new: true};
    var query = {"channelName": channelName};
    Channel.updatechannel (channelid,query,options).then(function(error,channel){
        if (error){
            return promise.done(error,null);
        }
        else{
            return promise.done(null,channel.parse());
        }
    });
    return promise;
};

exports.getinfo = function getinfo(channelid){
    var User = mongoose.model('User');
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();
    var query = {_id: channelid};
    var populate = 'users group';
    Channel.searchpopulated(query,populate).then(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else{
            var usuarios = [];
            for (i=0;i<channel.users.length;i++){
                var elto = {
                    id        : channel.users[i]._id,
                    username  : channel.users[i].username,
                    mail      : channel.users[i].mail
                };
                usuarios.push(elto);
            }
            var grupo = {
                groupid: channel.group._id,
                groupName: channel.group.groupName
            };
            var vuelta = {
                id: channel._id,
                channelName: channel.channelName,
                channelType: channel.channelType,
                users: usuarios,
                group: grupo
            };
            promise.done(null,vuelta);
        }
    });
    return promise;
};








