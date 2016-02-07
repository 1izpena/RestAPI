'use strict';

var Auth  = require('../helpers/authentication');
var groupservice  = require('../services/group');
var chatErrors  = require('../helpers/chatErrorsHandler');
var mongoose = require('mongoose');
var socketio  = require('../helpers/sockets');

exports.getusergrouplist = function getusergrouplist (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                groupservice.getgrouplist(result._id).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.getusersinvited = function getusersinvited (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                groupservice.getinviteduserslist(request.params.groupid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.getgroupinfo = function getgroupinfo (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                groupservice.getinfo(request.params.groupid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.getuserchatinfo = function getuserchatinfo (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                groupservice.getchatinfo(result._id).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.getgroupuserlist = function getgroupuserlist (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                groupservice.getuserlist(request.params.groupid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.getinvitationslist = function getinvitationslist (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                groupservice.getinvitations(request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.inviteusertogroup = function inviteusertogroup (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkisgroupadmin(request.params.groupid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        chatErrors.checkuserinvitedorgroup(request.params.groupid,request.params.userid1).then(function (error,result) {
                            if (error){
                                response.status(error.code).json({message: error.message});
                            } else {
                                groupservice.inviteuser(request.params.groupid,request.params.userid1).then(function (error,result){
                                    if(error){
                                        response.status(error.code).json({message: error.message});
                                    }else{
                                        //Notificamos al usuario que tiene una nueva invitacion
                                        socketio.getIO().sockets.to('US_'+request.params.userid1).emit('newGroupInvitation', result);
                                        response.json(result);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});

            }
        }
    });
};

exports.regretinvitation = function regretinvitation (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                groupservice.deleteinvitation(request.params.groupid,result).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});

            }
        }
    });
};

exports.acceptinvitation = function acceptinvitation (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkuseringroupinvitation(request.params.groupid,request.params.userid).then(function (error,result) {
                    if (error){
                        
                        response.status(error.code).json({message: error.message});
                    } else {
                        groupservice.subscribegroup(request.params.groupid,result,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                //al grupo que hay nuevo usuario
                                var query = {_id: request.params.userid};
                                var limit = 1;
                                var User = mongoose.model('User');
                                User.search(query,limit).then(function (error, user) {
                                    if (error){
                                        response.status(error.code).json({message: error.message});
                                    }
                                    else {
                                        if (user) {
                                            var vuelta = {
                                                id: user._id,
                                                username: user.username,
                                                mail: user.mail
                                            };
                                            socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('newMemberInGroup', {groupid: request.params.groupid, user: vuelta});
                                            socketio.getIO().sockets.to('US_'+request.params.userid).emit('newGroup', result);
                                            response.json(result);
                                        }
                                        else {
                                            var err = {
                                                code   : 404,
                                                message: 'User not found'
                                            };
                                            response.status(error.code).json({message: error.message});
                                        }
                                    }
                                });
                            }
                        });
                    }
                });

            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.deletegroupfromsystem = function deletegroupfromsystem (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkuseringroup(request.params.groupid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        chatErrors.checkisgroupadmin(request.params.groupid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                groupservice.removegroup(request.params.userid,request.params.groupid).then(function (error,result){
                                    if(error){
                                        response.status(error.code).json({message: error.message});
                                    }else{
                                        var i;
                                        for (i=0;i<result.users.length;i++){
                                            //al usuario que elimino el grupo no le notificamos
                                            //if (result.users[i].id != request.params.userid){
                                                socketio.getIO().sockets.to('US_'+ result.users[i].id).emit('deletedGroup', result);
                                            //}
                                        }
                                        response.json(result);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};


exports.deleteuserfromgroup = function deleteuserfromgroup (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkuseringroup(request.params.groupid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        chatErrors.checkisgroupadmin(request.params.groupid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                groupservice.deleteuser(request.params.userid,request.params.groupid,request.params.userid1).then(function (error,result){
                                    if(error){
                                        response.status(error.code).json({message: error.message});
                                    }else{
                                        var query = {_id: request.params.userid1};
                                        var limit = 1;
                                        var User = mongoose.model('User');
                                        User.search(query,limit).then(function (error, user) {
                                            if (error){
                                                response.status(error.code).json({message: error.message});
                                            }
                                            else {
                                                if (user) {
                                                    var vuelta = {
                                                        id: user._id,
                                                        username: user.username,
                                                        mail: user.mail
                                                    };
                                                    socketio.getIO().sockets.to('US_'+request.params.userid1).emit('deletedGroup', result);
                                                    socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('deletedMemberInGroup', {groupid: request.params.groupid, user: vuelta});
                                                    response.json(result);
                                                }
                                                else {
                                                    var err = {
                                                        code   : 404,
                                                        message: 'User not found'
                                                    };
                                                    response.status(error.code).json({message: error.message});
                                                }
                                            }
                                        });

                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});

            }
        }
    });
};

exports.unsuscribefromgroup = function unsuscribefromgroup (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkuseringroup(request.params.groupid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        var usuario = result;
                        groupservice.deleteuser(request.params.userid,request.params.groupid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                var vuelta = {
                                    id: usuario._id,
                                    username: usuario.username,
                                    mail: usuario.mail
                                };
                                socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('deletedMemberInGroup', {groupid: request.params.groupid, user:vuelta});
                                //No notificamos al usuario que se unsuscribed de que tiene un grupo menos, porque en angular ya se actualiza
                                //socketio.getIO().sockets.to('US_'+request.params.userid).emit('deletedGroup', result);
                                response.json(result);
                            }
                        });
                    }
                });
            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.addusertogroup = function addusertogroup (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkuseringroup(request.params.groupid,request.params.userid).then(function (error,result){
                    var user = result;
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        chatErrors.checkisgroupadmin(request.params.groupid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                groupservice.adduser(request.params.groupid,request.params.userid1).then(function (error,result){
                                    if(error){
                                        response.status(error.code).json({message: error.message});
                                    }else{
                                        var emitUser = {
                                            userid: user._id,
                                            username: user.username,
                                            mail: user.mail
                                        };
                                        socketio.getIO().sockets.to('GR_'+request.params.groupid).emit('newMemberInGroup', {groupid: request.params.groupid, user: emitUser});
                                        socketio.getIO().sockets.to('US_'+request.params.userid1).emit('newGroup', result);
                                        response.json(result);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};

exports.updategroupinfo = function updategroupinfo (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if (request.params.userid == result._id){
                chatErrors.checkuseringroup(request.params.groupid,request.params.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        chatErrors.checkisgroupadmin(request.params.groupid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                if (request.body.groupName == undefined || request.body.groupName == "" || request.body.groupName == null){
                                    console.log("Error 400 - You must enter a valid groupName");
                                    response.status(400).json({message: 'You must enter a valid groupName'});
                                } else {
                                    chatErrors.checkgroupnameunique(request.params.userid,request.body.groupName).then(function (error,result){
                                        if (error){
                                            response.status(error.code).json({message: error.message});
                                        }else {
                                            groupservice.updategroupname(request.params.userid, request.params.groupid,request.body.groupName).then(function (error,result){
                                                if(error){
                                                    console.log("error: " + error.code + ' ' + error.message);
                                                    response.status(error.code).json({message: error.message});
                                                }else{
                                                    var i;
                                                    for (i=0;i<result.users.length;i++){
                                                        //if (result.users[i].id != request.params.userid){
                                                            socketio.getIO().sockets.to('US_'+ result.users[i].id).emit('editedGroup', result);
                                                        //}
                                                    }
                                                    response.json(result);
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
                console.log("Error 401 - Unauthorized. You are trying to access with a different userid");
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});

            }
        }
    });
};

exports.newgroup = function newgroup (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            var userid = result._id;
            if (request.params.userid == result._id){
                if (request.body.groupName == undefined || request.body.groupName == "" || request.body.groupName == null){
                    console.log("You must enter a valid groupName");
                    response.status(400).json({message: 'You must enter a valid groupName'});
                } else {
                    chatErrors.checkgroupnameunique(result._id,request.body.groupName).then(function (error,result){
                        if (error){
                            response.status(error.code).json({message: error.message});
                        }else {
                            var userslist = [result._id];
                            var ats = {
                                groupName: request.body.groupName,
                                _admin: result._id,
                                users: userslist
                            };
                            groupservice.createnewgroup(ats,userid).then(function (error, group){
                                if (error){
                                    response.status(error.code).json({message: error.message});
                                }else {
                                    socketio.getIO().sockets.to('US_'+request.params.userid).emit('newGroup', group);
                                    response.json(group);
                                }
                            });
                        }
                    });
                }

            } else {
                response.status(401).json({message: 'Unauthorized. You are trying to access with a different userid'});
            }
        }
    });
};