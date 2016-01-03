var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var mongoose = require('mongoose');
var Hope  = require('hope');
var channelservice  = require('../services/channel');


exports.getgrouplist = function getgrouplist(userid){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    var query = { _id: userid};
    var populate = 'groups._group';
    User.searchpopulated(query,populate).then(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else {
            var vuelta = [];
            for (i=0;i<user.groups.length;i++){
                var elto = {
                    id        : user.groups[i]._group._id,
                    groupName  : user.groups[i]._group.groupName
                };
                vuelta.push(elto);
            }
            promise.done(null,vuelta);
        }
    });
    return promise;
};

exports.getchatinfo = function getchatinfo(userid){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    var query = { _id: userid};
    var populate = 'groups._group';
    User.searchpopulated(query,populate).then(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else {
            var grupos = [];
            var invitaciones = [];
            for (i=0;i<user.groups.length;i++){
                var elto = {
                    id        : user.groups[i]._group._id,
                    groupName  : user.groups[i]._group.groupName
                };
                grupos.push(elto);
            }
            for (j=0;j<user.invitations.length;j++){
                var elto2 = {
                    groupid        : user.invitations[j]._id,
                    groupname  : user.invitations[j].groupName
                };
                invitaciones.push(elto2);
            }
            var vuelta = {
                id: user._id,
                username: user.username,
                mail: user.mail,
                groups: grupos,
                invitations: invitaciones
            };
            return promise.done(null,vuelta);
        }
    });
    return promise;
};

exports.getuserlist = function getuserlist(groupid){
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var promise = new Hope.Promise();
    var query = {_id: groupid};
    var populate = 'users';
    Group.searchpopulated(query,populate).then(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else{
            var vuelta = [];
            for (i=0;i<group.users.length;i++){
                var elto = {
                    id        : group.users[i]._id,
                    username  : group.users[i].username,
                    mail      :group.users[i].mail
                };
                vuelta.push(elto);
            }
            promise.done(null,vuelta);
        }
    });
    return promise;
};

exports.getinvitations = function getinvitations(userid){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    var query = {_id: userid};
    var populate = 'invitations';
    User.searchpopulated(query,populate).then(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else{
            var vuelta = [];
            for (i=0;i<user.invitations.length;i++){
                var elto = {
                    groupid    : user.invitations[i]._id,
                    groupname  : user.invitations[i].groupName
                };
                vuelta.push(elto);
            }
            promise.done(null,vuelta);
        }
    });
    return promise;
};

exports.getinfo = function getinfo(groupid,userid){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var query = { _id: groupid};
    var populate = 'channels users';
    Group.searchpopulated(query,populate).then(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else {
            var publicos = [];
            var privados = [];
            var usuarios = [];
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
            for (k=0;k<group.users.length;k++){
                var elto = {
                    id        : group.users[k]._id,
                    username  : group.users[k].username,
                    mail      :group.users[k].mail
                };
                usuarios.push(elto);
            }
            var vuelta = {
                id: group._id,
                groupName: group.groupName,
                users: usuarios,
                publicChannels: publicos,
                privateChannels: privados
            };
            promise.done(null, vuelta);
        }
    });
    return promise;
};

exports.inviteuser = function inviteuser(groupid,userid){
    var promise = new Hope.Promise();
    var User = mongoose.model('User');
    var options = { new: true};
    var query = { $push: { "invitations": groupid} };
    User.updateuser (userid,query,options).then (function (error,user){
        if (error){
            return promise.done(error,null);
        }
        else{
            var invitaciones = [];
            for (i=0;i<user.invitations.length;i++){
                var elto = {
                    groupid        : user.invitations[i]._id,
                    groupname  : user.invitations[i].groupName
                };
                invitaciones.push(elto);
            }
            var vuelta = {
                id: user._id,
                username: user.username,
                mail:user.mail,
                invitations: invitaciones
            };
            return promise.done(null,vuelta);
        }
    });
    return promise;
};

exports.deleteinvitation = function deleteinvitation(groupid,user){
    var promise = new Hope.Promise();
    var User = mongoose.model('User');
    var encontrado = false;
    var i = 0;
    while (encontrado === false && i<user.invitations.length){
        if (user.invitations[i] == groupid){
            user.invitations.splice(i,1);
            encontrado = true;
        }
        i++;
    }
    var options = { new: true};
    var query = { "invitations": user.invitations };
    User.updateuser (user._id,query,options).then (function (error,user){
        if (error){
            return promise.done(error,null);
        }
        else{
            var vuelta = {
                id: user._id,
                username: user.username,
                mail:user.mail,
                invitations: user.invitations
            };
            return promise.done(null,vuelta);
        }
    });
    return promise;
};

exports.adduser = function adduser(groupid,userid){
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();
    var options = {new:true};
    var updateQuery = {$push:{"users":userid}};

    Group.updategroup (groupid,updateQuery,options).then (function (error,result){
        if (error){
            return promise.done(error,null);
        }
        else{
            var query = { _id: groupid};
            var populate = 'channels users';
            Group.searchpopulated(query,populate).then(function (error, group) {
                if (error){
                    return promise.done(error,null);
                }
                else {
                    var grupo = group;
                    var idpublicos = [];
                    for (i=0;i<grupo.channels.length;i++){
                        if (grupo.channels[i].channelType === "PUBLIC" ){
                            idpublicos.push(grupo.channels[i]._id);
                        }
                    }
                    var dat = {
                        _group: grupo._id,
                        privateChannels: []
                    };
                    var query2 = {$push:{"groups":dat}};
                    User.updateuser (userid,query2,{new:true}).then (function (error,user){
                        if (error){
                            return promise.done(error,null);
                        }
                        else{
                            var options2 = {new:true,multi:true};
                            var query3 = {_id:{$in:idpublicos}};
                            Channel.updatechannels(query3,updateQuery,options2).then(function (error,result){
                                if (error){
                                    return promise.done(error,null);
                                }
                                else {
                                    return promise.done(null,grupo.parse());
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

exports.subscribegroup = function subscribegroup(groupid,user){
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();
    var options = {new:true};
    var updateQuery = {$push:{"users":user._id}};
    Group.updategroup (groupid,updateQuery,options).then (function (error,result){
        if (error){
            return promise.done(error,null);
        }
        else{
            var query = { _id: groupid};
            var populate = 'channels users';
            Group.searchpopulated(query,populate).then(function (error, group) {
                if (error){
                    return promise.done(error,null);
                }
                else {
                    var grupo = group;
                    var idpublicos = [];
                    for (i=0;i<grupo.channels.length;i++){
                        if (grupo.channels[i].channelType === "PUBLIC" ){
                            idpublicos.push(grupo.channels[i]._id);
                        }
                    }
                    var dat = {
                        _group: grupo._id,
                        privateChannels: []
                    };
                    var encontrado = false;
                    var i = 0;
                    while (encontrado === false && i<user.invitations.length){
                        if (user.invitations[i] == groupid){
                            user.invitations.splice(i,1);
                            encontrado = true;
                        }
                        i++;
                    }
                    var query = { $push: { "groups": dat}, "invitations": user.invitations };
                    User.updateuser (user._id,query,options).then (function (error,user){
                        if (error){
                            return promise.done(error,null);
                        }
                        else{
                            var options2 = {new:true,multi:true};
                            var query3 = {_id:{$in:idpublicos}};
                            Channel.updatechannels(query3,updateQuery,options2).then(function (error,result){
                                if (error){
                                    return promise.done(error,null);
                                }
                                else {
                                    return promise.done(null,user.invitations);
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

exports.deleteuser = function deleteuser(groupid,userid){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var query = {_id: groupid};
    var limit = 1;
    Group.search(query,limit).then(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (group){
                var encontrado = false;
                var i = 0;
                while (encontrado === false && i<group.users.length){
                    if (group.users[i] == userid){
                        group.users.splice(i,1);
                        encontrado = true;
                    }
                    i++;
                }
                var options = {new: true};
                var updateQuery = {users: group.users};
                Group.updategroup (groupid,updateQuery,options).then (function (error,group){
                    if (error){
                        return promise.done(error,null);
                    }
                    else {
                        var grupo =  group;
                        var query = {_id: userid};
                        var limit = 1;
                        User.search(query,limit).then(function (error, user) {
                            if (error) {
                                return promise.done(error, null);
                            }
                            else {
                                var i = 0;
                                while (encontrado === false && i<user.groups.length){
                                    if (user.groups[i]._group == groupid){
                                        user.groups.splice(i,1);
                                        encontrado = true;
                                    }
                                    i++;
                                }
                                User.updateuser (userid,{groups: user.groups},{new: true}).then (function (error,user){
                                    if (error){
                                        return promise.done(error,null);
                                    }
                                    else{
                                        promise.done(null, grupo.parse());
                                    }
                                });

                            }
                        });
                    }
                });

            }else {
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

exports.createnewgroup = function createnewgroup(ats,userid){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var users = [userid];
    Group.creategroup(ats,userid).then(function(error, result){
        if (error){
            return promise.done(error, null);
        }else {
            var groupid = result._id;
            var channelName = "GENERAL";
            var channelType = "PUBLIC";
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
                    var dat = {
                        _group: groupid,
                        privateChannels: []
                    };
                    var query = {$push:{"groups":dat}};
                    var options = {new: true};
                    User.updateuser (userid,query,options).then (function (error,user){
                        if (error){
                            return promise.done(error,null);
                        }
                        else{
                            var updateQuery ={$push:{channels:channel._id}};
                            Group.updategroup(groupid,updateQuery,options).then(function (error,group){
                                if(error){
                                    return promise.done(error,null);
                                }else{
                                    var vuelta = {
                                        id: group._id,
                                        groupName: group.groupName
                                    };
                                    return promise.done(null,vuelta);
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

exports.updategroupname = function updategroupname(groupid,groupName){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var options = {new: true};
    var query = {"groupName": groupName};
    Group.updategroup (groupid,query,options).then (function (error,group){
        if (error){
            return promise.done(error,null);
        }
        else{
            return promise.done(null,group.parse());
        }
    });
    return promise;
};








