var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var mongoose = require('mongoose');
var Hope  = require('hope');


exports.getgrouplist = function getgrouplist(userid){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    var query = { _id: userid};
    var populate = 'groups._group invitations';
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
    var populate = 'groups._group invitations';
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
    Group.parsepopulated(userid,groupid).then(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else {
            return promise.done(null, group);
        }
    });
    return promise;
};

exports.inviteuser = function inviteuser(groupid,userid){
    var promise = new Hope.Promise();
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var options = { new: true};
    var query = { $push: { "invitations": groupid} };
    User.updateuser (userid,query,options).then (function (error,user){
        if (error){
            return promise.done(error,null);
        }
        else{
            var query = {_id: groupid};
            var limit = 1;
            Group.search(query,limit).then(function (error, group) {
                if (error){
                    return promise.done(error,null);
                }
                else{

                    var vuelta = {
                        groupid    : group._id,
                        groupName  : group.groupName
                    };
                    return promise.done(null,vuelta);
                }
            });
        }
    });
    return promise;
};

exports.deleteinvitation = function deleteinvitation(groupid,user){
    var promise = new Hope.Promise();
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
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
            var query = {_id: groupid};
            var limit = 1;
            Group.search(query,limit).then(function (error, group) {
                if (error){
                    return promise.done(error,null);
                }
                else{
                    var vuelta = {
                        groupid    : group._id,
                        groupName  : group.groupName
                    };
                    return promise.done(null,vuelta);
                }
            });
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
                        privateChannels: [],
                        directMessageChannels: []
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
                                    var Group = mongoose.model('Group');
                                    Group.parsepopulated(userid,groupid).then(function (error, group) {
                                        if (error){
                                            return promise.done(error,null);
                                        }
                                        else {
                                            return promise.done(null, group);
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

exports.subscribegroup = function subscribegroup(groupid,user,userid){
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
                        privateChannels: [],
                        directMessageChannels: []
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
                    var query = {$push:{"groups": dat}, "invitations": user.invitations };
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
                                    var Group = mongoose.model('Group');
                                    Group.parsepopulated(userid,groupid).then(function (error, group) {
                                        if (error){
                                            return promise.done(error,null);
                                        }
                                        else {
                                            return promise.done(null, group);
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

exports.deleteuser = function deleteuser(userid,groupid,rem){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var Channel = mongoose.model('Channel');
    var User = mongoose.model ('User');

    Group.updategroup(groupid,{$pull:{users:rem}}).then(function (error,result) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            var grupo = result;
            User.updateuser (rem,{$pull:{groups:{_group:groupid}}},{new: true}).then (function (error,user){
                if (error){
                    return promise.done(error,null);
                }
                else{
                    Channel.updatechannels({_id:{$in:grupo.channels}},{$pull:{users: rem}},{new: true}).then(function (error,result){
                        if (error){
                            return promise.done(error,null);
                        }
                        else {
                            var Group = mongoose.model('Group');
                            Group.parsepopulated(userid,groupid).then(function (error, group) {
                                if (error){
                                    return promise.done(error,null);
                                }
                                else {
                                    return promise.done(null, group);
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
                group: groupid,
                _admin: userid
            };
            Channel.createchannel (ats).then(function (error, result){
                if (error){
                    return promise.done(error,null);
                } else {
                    var channel = result;
                    var dat = {
                        _group: groupid,
                        privateChannels: [],
                        directMessageChannels: []
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
                                    Group.parsepopulated(userid,groupid).then(function (error, group) {
                                        if (error){
                                            return promise.done(error,null);
                                        }
                                        else {
                                            return promise.done(null, group);
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

exports.updategroupname = function updategroupname(userid,groupid,groupName){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var options = {new: true};
    var query = {"groupName": groupName};
    Group.updategroup (groupid,query,options).then (function (error,group){
        if (error){
            console.log("error update");
            return promise.done(error,null);
        }
        else{
            console.log("ok update");
            var Group = mongoose.model('Group');
            Group.parsepopulated(userid,groupid).then(function (error, group) {
                if (error){
                    return promise.done(error,null);
                }
                else {
                    return promise.done(null, group);
                }
            });
        }
    });
    return promise;
};

exports.removegroup = function removegroup(userid,groupid){
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');

    Group.parsepopulated(userid,groupid).then(function (error, group) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (group){
                var grupo = group;
                User.updateuser (userid,{$pull:{groups:{_group:groupid}}},{new: true}).then (function (error,user){
                    if (error){
                        return promise.done(error,null);
                    }
                    else{
                        Channel.deletechannels({_id:{$in:grupo.channels}}).then(function (error,result){
                            if(error){
                                return promise.done(error,null);
                            }
                            else {
                                Group.deletegroup(groupid).then (function (error){
                                    if(error){
                                        return promise.done(error,null);
                                    }
                                    else {
                                        return promise.done(null,grupo);
                                    }
                                });
                            }
                        });

                    }
                });
            } else {
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








