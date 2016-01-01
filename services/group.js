var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var mongoose = require('mongoose');
var Hope  = require('hope');



exports.getgrouplist = function getgrouplist(userid){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    User.findOne({ _id: userid}).populate('groups._group','_id groupName').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (user){
                var vuelta = [];
                for (i=0;i<user.groups.length;i++){
                    var elto = {
                        id        : user.groups[i]._group._id,
                        groupName  : user.groups[i]._group.groupName
                    };
                    vuelta.push(elto);
                }
                promise.done(null,vuelta);
            }else {
                var err = {
                    code   : 403,
                    message: 'the user has no groups'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

exports.getchatinfo = function getchatinfo(userid){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    User.findOne({ _id: userid}).populate('groups._group invitations','_id groupName').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (user){
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
            }else {
                var err = {
                    code   : 403,
                    message: 'User not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

exports.getuserlist = function getuserlist(groupid){
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var promise = new Hope.Promise();
    Group.findOne({_id: groupid}).populate('users').exec(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else{
            if (group){
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

exports.getinvitations = function getinvitations(userid){
    var User = mongoose.model('User');
    var promise = new Hope.Promise();
    User.findOne({_id: userid}).populate('invitations').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else{
            if (user){
                var vuelta = [];
                for (i=0;i<user.invitations.length;i++){
                    var elto = {
                        groupid        : user.invitations[i]._id,
                        groupname  : user.invitations[i].groupName
                    };
                    vuelta.push(elto);
                }
                promise.done(null,vuelta);
            } else {
                var err = {
                    code   : 403,
                    message: 'user not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

exports.getinfo = function getinfo(groupid,userid){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    Group.findOne({ _id: groupid}).populate('channels users').exec(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (group){
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

exports.adduser = function adduser(groupid,userid){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var User = mongoose.model('User');
    var options = { new: true};
    var updateQuery = { $push: { "users": userid} };
    Group.updategroup (groupid,updateQuery,options).then (function (error,group){
        if (error){
            return promise.done(error,null);
        }
        else{
            var grupo = group;
            var privatechannels = [];
            var dat = {
                _group: group._id,
                privateChannels: privatechannels
            };
            var query = { $push: { "groups": dat} };
            User.updateuser (userid,query,options).then (function (error,user){
                if (error){
                    return promise.done(error,null);
                }
                else{
                    return promise.done(error, grupo.parse());
                }
            });
        }
    });
    return promise;
};

exports.subscribegroup = function subscribegroup(groupid,user){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var User = mongoose.model('User');
    var options = { new: true};
    var updateQuery = { $push: { "users": user._id} };
    Group.updategroup (groupid,updateQuery,options).then (function (error,group){
        if (error){
            return promise.done(error,null);
        }
        else{
            var grupo = group;
            var privatechannels = [];
            var dat = {
                _group: group._id,
                privateChannels: privatechannels
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
                    return promise.done(error, user);
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
                var options = { new: true};
                var updateQuery = { users: group.users};
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
    var Group = mongoose.model('Group');
    Group.creategroup(ats,userid).then(function creategroup (error, result){
        if (error){
            return promise.done(error, null);
        }else {
            var groupid = result._id;
            var ats = {channelName:"GENERAL",channelType:"PUBLIC"};
            Channel.createchannel (ats,userid,groupid).then(function createchannel (error, result){
                if (error){
                    return promise.done(error, null);
                } else {
                    var limit = 1;
                    var query = {"_id":groupid};
                    Group.search(query, limit).then(function search (error, group){
                        if(error){
                            return promise.done(error, null);
                        }else{
                            return promise.done(null, group);
                        }
                    });
                }
            });
        }
    });
    return promise;
};










