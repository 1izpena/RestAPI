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
    User.findOne({ _id: userid}).populate('groups._group','_id groupName').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (user){
                var grupos = [];
                for (i=0;i<user.groups.length;i++){
                    var elto = {
                        id        : user.groups[i]._group._id,
                        groupName  : user.groups[i]._group.groupName
                    };
                    grupos.push(elto);
                }
                var vuelta = {
                    id: user._id,
                    username: user.username,
                    groups: grupos
                };
                promise.done(null,vuelta);
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

exports.getinfo = function getinfo(groupid){
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (group){
                promise.done(null, group.parse());
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










