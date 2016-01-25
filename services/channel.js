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
                    code   : 403,
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
                                        Channel.parsepopulated(userid,channel.id).then(function (error, result) {
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
                                            Channel.parsepopulated(userid,channel.id).then(function (error, result) {
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
                                        Channel.parsepopulated(userid,channel.id).then(function (error, result) {
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
            var directos = [];
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
                                var Channel = mongoose.model('Channel');
                                Channel.parsepopulated(userid,channelid).then(function (error, result) {
                                    if (error){
                                        return promise.done(error,null);
                                    }
                                    else {
                                        return promise.done(null, result);
                                    }
                                });
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
                if (channel.users.length >=1){
                    var query = "";
                    if (userid == channel._admin){
                        query = {users: channel.users, _admin:channel.users[0]};
                    } else {
                        query = {users: channel.users};
                    }
                    var options = {new:true};
                    var Channel = mongoose.model('Channel');
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
                                        User.updateuser(userid,update,options).then(function (error,user){
                                            if(error){
                                                return promise.done(error,null);
                                            }else{
                                                var Channel = mongoose.model('Channel');
                                                Channel.parsepopulated(userid,channelid).then(function (error, result) {
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
                    var Channel = mongoose.model('Channel');
                    Channel.parsepopulated(userid,channelid).then(function (error, result) {
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
                                    if (result.channelType === "PRIVATE"){
                                     socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('deletedPrivateChannel', vuelta);
                                     }
                                     if (result.channelType == "PUBLIC"){
                                     socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('deletedPublicChannel', vuelta);
                                     }
                                    promise.done(null,vuelta);
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
                                Channel.parsepopulated(userid,channelid).then(function (error, result) {
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
    var query = {_id: groupid};
    var query1 = {_id: channelid};
    var limit1 = 1;

    Channel.search(query1,limit1).then(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else {
            var userschannel = channel.users;
            if (channel){
                var Channel = mongoose.model('Channel');
                var vuelta = channel;
                Channel.parsepopulated(userid,channelid).then(function (error, result) {
                    if (error){
                        return promise.done(error,null);
                    }
                    else {
                        Channel.deletechannel (channelid).then(function(error){
                            if (error){
                                return promise.done(error,null);
                            }
                            else{
                                //buscamos el groupid en user y quitamos el channel de privatechannels
                                //eliminamos el canal de grupo
                                var query3 = {_id:{$in:userschannel}};
                                var populate = 'groups._group';
                                User.searchpopulatedmany(query3,populate).then(function (error, users) {
                                    if (error){
                                        return promise.done(error,null);
                                    }
                                    else {
                                        for (i=0;i<users.length;i++){
                                            var listaGrupos = users[i].groups;
                                            var encontrado = false;
                                            var j = 0;
                                            while (encontrado == false && j<listaGrupos.length){
                                                if (groupid == listaGrupos[j]._group._id){
                                                    for (k=0;k<listaGrupos[j].privateChannels.length;k++){
                                                        if (channelid == listaGrupos[j].privateChannels[k]){
                                                            listaGrupos[j].privateChannels.splice(k,1);
                                                            encontrado = true;
                                                        }
                                                    }
                                                }
                                                j++;
                                            }
                                            if (encontrado == true){
                                                var update = {"groups":listaGrupos};
                                                var options = {multi: true};
                                                User.updateuser(users[i]._id,update,options).then(function updateuser (error){
                                                    if(error){
                                                        return promise.done(error,null);
                                                    }
                                                });
                                            }
                                        }
                                        //quitamos canal de grupo
                                        Group.search(query,limit1).then(function (error, group) {
                                            if (error){
                                                return promise.done(error,null);
                                            }
                                            else {
                                                if (group){
                                                    var encontrado1 = false;
                                                    var i = 0;
                                                    while (encontrado1 === false && i<group.channels.length){
                                                        if (group.channels[i] == channelid){
                                                            group.channels.splice(i,1);
                                                            encontrado1 = true;
                                                        }
                                                        i++;
                                                    }
                                                    if (encontrado1 == true){
                                                        var options = {new: true};
                                                        var updateQuery = {channels: group.channels};
                                                        Group.updategroup (groupid,updateQuery,options).then (function (error,group){
                                                            if (error){
                                                                return promise.done(error,null);
                                                            }
                                                            else {
                                                                return promise.done(null, vuelta);
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    var err3 = {
                                                        code   : 403,
                                                        message: 'group not found'
                                                    };
                                                    return promise.done(err3, null);
                                                }
                                            }
                                        });

                                    }
                                });//hasta akiii
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

exports.getinfo = function getinfo(channelid){
    var User = mongoose.model('User');
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();
    var query = {_id: channelid};
    var populate = 'users group _admin';
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
            var elto5 = {
                id        : channel._admin._id,
                username  : channel._admin.username,
                mail      : channel._admin.mail
            };
            var vuelta = {
                id: channel._id,
                channelName: channel.channelName,
                channelType: channel.channelType,
                users: usuarios,
                admin: elto5,
                group: grupo
            };
            promise.done(null,vuelta);
        }
    });
    return promise;
};








