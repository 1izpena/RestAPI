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
            var encontrado = false;
            var i = 0;
            var listaGrupos = user.groups;
            while (encontrado === false && i<listaGrupos.length){
                if (listaGrupos[i]._group.groupName === groupname){
                    encontrado = true;
                }
                i++;
            }
            if (encontrado === true){
                var err = {
                    code   : 401,
                    message: 'The user already has a group with that name'
                };
                console.log("Error 401 - the user already has a group with that name");
                return promise.done(err, null);
            }else {
                return promise.done(null, user);
            }
        }
    });
    return promise;
};

exports.checkchannelnameunique = function checkchannelnameunique(userid,groupid,channelname,channeltype){
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();
    if (channeltype == "PUBLIC"){
        Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
            if (error){
                return promise.done(error,null);
            }
            else if (group){
                var i=0;
                var encontrado = false;
                var canales = group.channels;
                while (encontrado === false && i<canales.length){
                    if (channelname === canales[i].channelName && canales[i].channelType=="PUBLIC"){
                        encontrado = true;
                    }
                    i++;
                }
                if (encontrado === true){
                    var err = {
                        code   : 401,
                        message: 'the group already has a public channel with that name'
                    };
                    console.log("Error 401 - the user already has a public channel with that name");
                    return promise.done(err, null);
                }else {
                    return promise.done(null, group);
                }
            }
        });
    }if (channeltype == "PRIVATE"){
        Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
            if (error){
                return promise.done(error,null);
            }
            else if (group){
                var i = 0;
                var encontrado = false;
                var canales = group.channels;
                while (encontrado === false && i<canales.length){
                    if (channelname === canales[i].channelName && canales[i].channelType=="PRIVATE"){
                        encontrado = true;
                    }
                    i++;
                }
                if (encontrado === true){
                    var err = {
                        code   : 403,
                        message: 'the group already has a private channel with that name'
                    };
                    console.log("Error 401 - the user already has a private channel with that name");
                    return promise.done(err, null);
                }else {
                    return promise.done(null, group);
                }
            }
        });
    } if (channeltype == "DIRECT"){
        Group.findOne({ _id: groupid}).populate('channels').exec(function (error, group) {
            if (error){
                return promise.done(error,null);
            }
            else if (group){
                var i = 0;
                var encontrado = false;
                var canales = group.channels;
                while (encontrado === false && i<canales.length){
                    if (channelname === canales[i].channelName && canales[i].channelType=="DIRECT"){
                        encontrado = true;
                    }
                    i++;
                }
                if (encontrado === true){
                    var err = {
                        code   : 403,
                        message: 'the group already has a private channel with that name'
                    };
                    console.log("Error 401 - the user already has a direct channel with that name");
                    return promise.done(err, null);
                }else {
                    return promise.done(null, group);
                }
            }
        });
    }

    return promise;
};

exports.checknewchannelparams = function checknewchannelparams(userid,groupid,channelname,channeltype){
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    var Channel = mongoose.model('Channel');
    var promise = new Hope.Promise();
    if (channelname == undefined || channelname == "" || channelname == null){
        var err = {
            code   : 401,
            message: 'channelName must have a value'
        };
        return promise.done(err, null);
    } if (channelname != undefined && channelname != "" && channelname != null) {
        if (channeltype != "PUBLIC" && channeltype != "PRIVATE" && channeltype != "DIRECT") {
            var err1 = {
                code: 401,
                message: 'channelType must be PUBLIC/PRIVATE/DIRECT'
            };
            return promise.done(err1, null);
        } else {
            var message = 'imput params correct';
            return promise.done(null, message);
        }
    }
    return promise;
};

exports.checkisgroupadmin = function(groupid,userid) {
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group');
    var query = {_id: groupid};
    var limit = 1;
    Group.search(query,limit).then(function (error, group) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (group){
                if (userid == group._admin){
                    console.log("the user is the admin of the group");
                    return promise.done(null, group);
                }else {
                    var err = {
                        code   : 401,
                        message: 'you are not the admin of the group'
                    };
                    console.log("Error 401 - you are not the admin of the group");
                    return promise.done(err, null);
                }
            }else {
                var err1 = {
                    code   : 401,
                    message: 'group not found'
                };
                console.log("Error 401 - group not found");
                return promise.done(err1, null);
            }
        }
    });
    return promise;
};

exports.checkischanneladmin = function(channelid,userid) {
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var query = {_id: channelid};
    var limit = 1;
    Channel.search(query,limit).then(function (error, channel) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (channel){
                if (userid == channel._admin){
                    console.log("userid: " + userid);
                    console.log("channel._admin: " + channel._admin);
                    console.log("the user is the admin of the channel");
                    return promise.done(null, channel);
                }else {
                    var err = {
                        code   : 401,
                        message: 'you are not the admin of the channel'
                    };
                    console.log("Error 401 - the user is not the admin of the channel");
                    return promise.done(err, null);
                }
            }else {
                var err1 = {
                    code   : 401,
                    message: 'channel not found'
                };
                console.log("Error 401 - channel not found");
                return promise.done(err1, null);
            }
        }
    });
    return promise;
};

exports.checkuseringroupinvitation = function(groupid,userid) {
    var promise = new Hope.Promise();
    var User = mongoose.model('User');
    var query = {_id: userid};
    var populate = 'groups._group';
    User.searchpopulated(query,populate).then(function (error, user) {
        if (error) {

            return promise.done(error, null);
        }
        else {
            if (user){
                var encontrado = false;
                var j = 0;
                while (encontrado == false && j<user.groups.length){
                    if (groupid == user.groups[j]._group._id){
                        encontrado = true;
                    }
                    j++;
                }
                if (encontrado){
                    var err = {
                        code   : 401,
                        message: 'the user is already a member of the group'
                    };
                    console.log("Error 401 - the user already is a member of the group");
                    return promise.done(err, null);
                }else {
                    return promise.done(null, user);
                }
            }else {
                var err2 = {
                    code   : 401,
                    message: 'group not found'
                };
                console.log("Error 401 - group not found");
                return promise.done(err2, null);
            }
        }
    });
    return promise;
};


exports.checkuseringroup = function(groupid,userid) {
    var promise = new Hope.Promise();
    var User = mongoose.model('User');
    var query = {_id: userid};
    var populate = 'groups._group';
    User.searchpopulated(query,populate).then(function (error, user) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (user){
                var encontrado = false;
                var j = 0;
                while (encontrado == false && j<user.groups.length){
                    if (groupid == user.groups[j]._group._id){
                        encontrado = true;
                    }
                    j++;
                }
                if (encontrado){
                    console.log("the user is a member of the group");
                    return promise.done(null, user);

                }else {
                    var err = {
                        code   : 401,
                        message: 'the user is not a member of the group'
                    };
                    console.log("Error 401 - the user is not a member of the group");
                    return promise.done(err, null);
                }
            }else {
                var err2 = {
                    code   : 401,
                    message: 'group not found'
                };
                console.log("Error 401 - group not found");
                return promise.done(err2, null);
            }
        }
    });
    return promise;
};

exports.checkuserinvitedorgroup = function(groupid,userid) {
    var promise = new Hope.Promise();
    var User = mongoose.model('User');
    var query = {_id: userid};
    var populate = 'groups._group invitations';
    User.searchpopulated(query,populate).then(function (error, user) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (user){
                var encontrado = false;
                var j = 0;
                while (encontrado == false && j<user.groups.length){
                    if (groupid == user.groups[j]._group._id){
                        encontrado = true;
                    }
                    j++;
                }
                if (encontrado){
                    var err = {
                        code   : 401,
                        message: 'the user is already a member of the group'
                    };
                    console.log("Error 401 - the user is already a member of the group");
                    return promise.done(err, null);
                }else {
                    var encontrado1 = false;
                    var i = 0;
                    while (encontrado1 == false && i<user.invitations.length){
                        if (groupid == user.invitations[i]._id){
                            encontrado1 = true;
                        }
                        i++;
                    }
                    if (encontrado1) {
                        var err1 = {
                            code: 401,
                            message: 'the user already has an invitation to the group'
                        };
                        console.log("Error 401 - the user already has an invitation to the group");
                        return promise.done(err1, null);
                    } else {
                        return promise.done(null, user);
                    }
                }
            }else {
                var err2 = {
                    code   : 401,
                    message: 'group not found'
                };
                return promise.done(err2, null);
            }
        }
    });
    return promise;
};

exports.checkuserinchanneladd = function(channelid,userid) {
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var query = {_id: channelid};
    var limit = 1;
    Channel.search(query,limit).then(function (error, channel) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (channel){
                var encontrado = false;
                var j = 0;
                while (encontrado == false && j<channel.users.length){
                    if (userid == channel.users[j]){
                        encontrado = true;
                    }
                    j++;
                }
                if (encontrado){
                    var err = {
                        code   : 401,
                        message: 'the user is already a member of the channel'
                    };
                    console.log("Error 401 - the user already is already a member of the channel");
                    return promise.done(err, null);
                }else {
                    return promise.done(null, channel);
                }
            }else {
                var err1 = {
                    code   : 401,
                    message: 'channel not found'
                };
                return promise.done(err1, null);
            }
        }
    });
    return promise;
};

exports.checkuserinchannel = function(channelid,userid) {
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel');
    var query = {_id: channelid};
    var limit = 1;
    Channel.search(query,limit).then(function (error, channel) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (channel){
                var encontrado = false;
                var j = 0;
                while (encontrado == false && j<channel.users.length){
                    if (userid == channel.users[j]){
                        console.log("userid: " + userid);
                        console.log("channel.users[j]: " + channel.users[j]);
                        encontrado = true;
                    }
                    j++;
                }
                if (encontrado){
                    console.log("the user is a member of the channel");
                    return promise.done(null, channel);
                }else {
                    var err = {
                        code   : 401,
                        message: 'the user is not a member of the channel'
                    };
                    console.log("Error 401 - the user is not a member of the channel");
                    return promise.done(err, null);
                }
            }else {
                var err1 = {
                    code   : 401,
                    message: 'channel not found'
                };
                return promise.done(err1, null);
            }
        }
    });
    return promise;
};
