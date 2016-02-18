'use strict';

var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var Hope  = require('hope');
var mongoose = require('mongoose');
var async = require("async");
var chatErrors  = require('../helpers/chatErrorsHandler');
var channelservice  = require('../services/channel');
var groupservice  = require('../services/group');
var socketio  = require('../helpers/sockets');

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
                        return promise.done(null,user);
                    }
                });
            }
            if (channelType == "DIRECT"){
                var listaGrupos1 = user.groups;
                var encontrado1 = false;
                var j = 0;
                while (encontrado1 === false && j<user.groups.length){
                    if (groupid == listaGrupos1[j]._group._id){
                        {
                            listaGrupos1[j].directMessageChannels.push(channelid);
                            encontrado1 = true;
                        }
                    }
                    j++;
                }
                var update1 = {"groups":listaGrupos1};
                var options1 = {multi: true};
                User.updateuser(userid,update1,options1).then(function (error,user){
                    if(error){
                        return promise.done(error,null);
                    }else{
                        return promise.done(null,user);
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

exports.updatechannelpublicuserlist = function updatechannelpublicuserlist(groupid,channelid){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var Group = mongoose.model('Group');
    var query = {_id: groupid};
    var limit = 1;
    Group.search(query,limit).then(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (group){
                var users = group.users;
                var options = {new: true};
                var updateQuery = {"users": users};
                Channel.updatechannel (channelid,updateQuery,options).then (function (error,channel) {
                    if (error) {
                        return promise.done(error, null);
                    }
                    else {

                        return promise.done(null, channel);
                    }
                });
            } else {
                var err = {
                    code   : 400,
                    message: 'group not found'
                };
                return promise.done(err, null);
            }
        }
    });

    return promise;
};

exports.createnewchannel = function createnewchannel(userid,groupid,channelName,channelType, userid2){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    chatErrors.checkchannelnameunique(userid,groupid,channelName,channelType).then(function (error,result){
        if (error){
            return promise.done(error,null);
        }else {
            var users ;
            if (channelType == 'DIRECT') {
                users = [userid, userid2]
            }
            else {
                users = [userid];
            }
            var ats = {
                channelName: channelName,
                channelType: channelType,
                _admin: userid,
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
                            if (channelType == "PRIVATE" || channelType == "DIRECT"){
                                channelservice.updateuserchannellist(userid,groupid, result._id,channelType).then(function(error,result){
                                    if (error){
                                        return promise.done(error,null);
                                    }
                                    else {
                                        var Channel = mongoose.model('Channel');
                                        Channel.parsepopulated(channel.id).then(function (error, result) {
                                            if (error){
                                                return promise.done(error,null);
                                            }
                                            else {
                                                return promise.done(null, result);
                                            }
                                        });
                                    }
                                });
                                if (channelType == "DIRECT") {
                                    channelservice.updateuserchannellist(userid2,groupid, result._id,channelType).then(function(error,result){
                                        if (error){
                                            return promise.done(error,null);
                                        }
                                        else {
                                            var Channel = mongoose.model('Channel');
                                            Channel.parsepopulated(channel.id).then(function (error, result) {
                                                if (error){
                                                    return promise.done(error,null);
                                                }
                                                else {
                                                    return promise.done(null, result);
                                                }
                                            });
                                        }
                                    });
                                }
                            } else {
                                channelservice.updatechannelpublicuserlist(groupid,channel.id).then(function (error, group) {
                                    if (error){
                                        return promise.done(error,null);
                                    }
                                    else {
                                        var Channel = mongoose.model('Channel');
                                        Channel.parsepopulated(channel.id).then(function (error, result) {
                                            if (error){
                                                return promise.done(error,null);
                                            }
                                            else {
                                                return promise.done(null, result);
                                            }
                                        });
                                    }
                                });

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
    var populate = 'users _admin';
    Channel.searchpopulated(query,populate).then(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else{
            var users = [];
            for (var i=0;i<channel.users.length;i++){
                var elto = {
                    id        : channel.users[i]._id,
                    username  : channel.users[i].username,
                    mail      :channel.users[i].mail
                };
                users.push(elto);
            }
            var admin = {
                id: channel._admin._id,
                username: channel._admin.username,
                mail:  channel._admin.mail
            };
            var vuelta = {
                admin: admin,
                users: users
            };
            return promise.done(null,vuelta);
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
            var directos = [];
            for (var i=0;i<group.channels.length;i++){
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
                        }if (group.channels[i].channelType == "PRIVATE" ) {
                            privados.push(elto);
                        }if (group.channels[i].channelType == "DIRECT" ) {
                            directos.push(elto);
                        }
                        encontrado = true;
                    }
                    j++;
                }
            }
            var vuelta = {
                publicChannels: publicos,
                privateChannels: privados,
                directMessageChannels: directos
            };
            return promise.done(null,vuelta);
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
                                var Channel = mongoose.model('Channel');
                                Channel.parsepopulated(channelid).then(function (error, result) {
                                    if (error){
                                        return promise.done(error,null);
                                    }
                                    else {
                                        return promise.done(null, result);
                                    }
                                });
                            }
                        });
                    }
                });
            }else {
                var err = {
                    code   : 400,
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
                var Channel = mongoose.model('Channel');
                if (channel.users.length >=1){
                    var query = "";
                    if (userid == channel._admin){
                        query = {users: channel.users, _admin:channel.users[0]};
                    } else {
                        query = {users: channel.users};
                    }
                    var options = {new:true};
                    Channel.updatechannel(channelid,query,options).then(function (error, result){
                        if (error){
                            return promise.done(error,null);
                        }
                        else{
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
                                    while (encontrado == false && j<listaGrupos.length){
                                        if (groupid == listaGrupos[j]._group._id){
                                            if (channelType == "PRIVATE"){
                                                for (var k=0;k<listaGrupos[j].privateChannels.length;k++){
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
                                        User.updateuser(userid,update,options).then(function (error,user){
                                            if(error){
                                                return promise.done(error,null);
                                            }else{
                                                var Channel = mongoose.model('Channel');
                                                Channel.parsepopulated(channelid).then(function (error, result) {
                                                    if (error){
                                                        return promise.done(error,null);
                                                    }
                                                    else {
                                                        return promise.done(null, result);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                            });
                        }
                    });
                } else {
                    //eliminamos el canal
                    Channel.parsepopulated(channelid).then(function (error, result) {
                        if (error){
                            return promise.done(error,null);
                        }
                        else {
                            var vuelta = result;
                            channelservice.removechannel(userid,groupid,channelid).then(function (error,result){
                                if(error){
                                    return promise.done(error,null);
                                }else{
                                    console.log("channel succesfully deleted");
                                    if (vuelta.channelType === "PRIVATE"){
                                        socketio.getIO().sockets.to('GR_'+ groupid).emit('deletedPrivateChannel', vuelta);
                                    }
                                    if (vuelta.channelType == "PUBLIC"){
                                        socketio.getIO().sockets.to('GR_'+ groupid).emit('deletedPublicChannel', vuelta);
                                    }
                                    return promise.done(null,vuelta);
                                }
                            });

                        }
                    });

                }
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

exports.updatechannelname = function updatechannelname(userid,groupid,channelid,channelName){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var query1 = {_id: channelid};
    var limit1 = 1;
    Channel.search(query1,limit1).then(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (channel){
                var channelType = channel.channelType;
                chatErrors.checkchannelnameunique(userid,groupid,channelName,channelType).then(function (error,result){
                    if (error){
                        return promise.done(error,null);
                    }else {
                        var options = {new: true};
                        var query = {"channelName": channelName};
                        Channel.updatechannel (channelid,query,options).then(function(error,channel){
                            if (error){
                                return promise.done(error,null);
                            }
                            else{
                                var Channel = mongoose.model('Channel');
                                Channel.parsepopulated(channelid).then(function (error, result) {
                                    if (error){
                                        return promise.done(error,null);
                                    }
                                    else {
                                        return promise.done(null, result);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
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

exports.removechannel = function removechannel(userid,groupid,channelid){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var Message = mongoose.model('Message');
    Channel.search({_id:channelid},1).then(function (error, result) {
        if (error){
            return promise.done(error,null);
        }
        else {

            var canal = result;
            var Channel = mongoose.model('Channel');
            Channel.parsepopulated(channelid).then(function (error, result) {
                if (error){
                    return promise.done(error,null);
                }
                else {
                    var vuelta = result;
                    Channel.deletechannel (channelid).then(function(error){
                        if (error){
                            return promise.done(error,null);
                        }
                        else{
                            //buscamos el groupid en user y quitamos el channel de privatechannels
                            //eliminamos el canal de grupo
                            console.log("users: " + canal.users);
                            var query3 = {_id:{$in:canal.users}};
                            var populate = 'groups._group';
                            User.searchpopulatedmany(query3,populate).then(function (error, users) {
                                if (error){
                                    return promise.done(error,null);
                                }
                                else {
                                    for (var i=0;i<users.length;i++){
                                        var listaGrupos = users[i].groups;
                                        var encontrado = false;
                                        var j = 0;
                                        while (encontrado == false && j<listaGrupos.length){
                                            if (groupid == listaGrupos[j]._group._id){
                                                for (var k=0;k<listaGrupos[j].privateChannels.length;k++){
                                                    if (channelid == listaGrupos[j].privateChannels[k]){
                                                        listaGrupos[j].privateChannels.splice(k,1);
                                                        encontrado = true;
                                                    }
                                                }
                                            }
                                            j++;
                                        }
                                        if (encontrado == true){
                                            console.log("encontrado canal privado en user");
                                            var update = {"groups":listaGrupos};
                                            var options = {multi: true};
                                            User.updateuser(users[i]._id,update,options).then(function updateuser (error){
                                                if(error){
                                                    return promise.done(error,null);
                                                }
                                            });
                                        }
                                    }
                                    Group.updategroup({_id:groupid},{$pull:{channels: channelid}},{new: true}).then(function (error,group){
                                        if (error){
                                            return promise.done(error,null);
                                        }
                                        else {
                                            var query3 = {_channel:channelid};
                                            Message.deletemessages(query3).then(function (error,result){
                                                if(error){
                                                    return promise.done(error,null);
                                                }
                                                else {

                                                    if (vuelta.channelType === "PRIVATE"){
                                                        socketio.getIO().sockets.to('GR_'+ groupid).emit('deletedPrivateChannel', vuelta);
                                                    }
                                                    if (vuelta.channelType == "PUBLIC"){
                                                        socketio.getIO().sockets.to('GR_'+ groupid).emit('deletedPublicChannel', vuelta);
                                                    }
                                                    console.log("Message deleted successfully");
                                                    return promise.done(null, vuelta);
                                                }
                                            });

                                        }
                                    });

                                }
                            });
                        }
                    });



                }
            });

        }
    });
    return promise;
};

exports.getinfo = function getinfo(userid,channelid){
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();
    Channel.parsepopulated(channelid).then(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else {
            return promise.done(null, channel);
        }
    });
    return promise;
};

exports.getallgroupschannellist = function getallgroupschannellist (userid) {

    var promise = new Hope.Promise();

    groupservice.getgrouplist(userid).then(function (error,groups){
        if(error){
            return promise.done(error,null);
        }else{
            var channels = []
            async.each(groups, function (group, callback){
                    groupservice.getinfo(group.id,userid).then(function (error, result){
                        if(error){
                            callback(error);
                        }
                        else{
                            channels = channels
                                .concat(result.publicChannels)
                                .concat(result.privateChannels)
                                .concat(result.directMessageChannels);
                            callback();
                        }
                    });
                }
                ,function(error) {
                    if(error) {
                        return promise.done(error,null);
                    }
                    else {
                        return promise.done(null,channels);
                    }

                }
            );
        }
    });

    return promise;
}








