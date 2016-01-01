'use strict';

var Auth  = require('../helpers/authentication');
var groupservice  = require('../services/group');
var chatErrors  = require('../helpers/chatErrorsHandler');
var mongoose = require('mongoose');


exports.getusergrouplist = function getusergrouplist (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if ( request.body.userid == result._id){
                groupservice.getgrouplist(result._id).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
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
            if ( request.body.userid == result._id){
                groupservice.getinfo(request.params.groupid,request.body.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
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
            if ( request.body.userid == result._id){
                groupservice.getchatinfo(result._id).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
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
            if ( request.body.userid == result._id){
                groupservice.getuserlist(request.params.groupid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
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
            if ( request.body.userid == result._id){
                groupservice.getinvitations(request.body.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
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
            if ( request.body.userid == result._id){
                chatErrors.checkisgroupadmin(request.params.groupid,request.body.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        groupservice.inviteuser(request.params.groupid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
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

exports.regretinvitation = function regretinvitation (request, response) {
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if ( request.body.userid == result._id){
                groupservice.deleteinvitation(request.params.groupid,result).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
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
            if ( request.body.userid == result._id){
                groupservice.subscribegroup(request.params.groupid,result).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            } else {
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
            if ( request.body.userid == result._id){
                chatErrors.checkisgroupadmin(request.params.groupid,request.body.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        groupservice.deleteuser(request.params.groupid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
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

exports.unsuscribefromgroup = function unsuscribefromgroup (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            if ( request.body.userid == result._id){
                groupservice.deleteuser(request.params.groupid,request.body.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
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
            if ( request.body.userid == result._id){
                chatErrors.checkisgroupadmin(request.params.groupid,request.body.userid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        groupservice.adduser(request.params.groupid,request.params.userid).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
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

exports.newgroup = function newgroup (request, response){
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            var userid = result._id;
            if ( request.body.userid == result._id){
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
                        groupservice.createnewgroup(ats,userid).then(function createnewgroup (error, group){
                            if (error){
                                response.status(error.code).json({message: error.message});
                            }else {
                                response.json(group.parse());
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