'use strict';

var Group  = require('../models/group');
var Channel  = require('../models/channel');
var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var groupservice  = require('../services/group');
var chatErrors  = require('../helpers/chatErrorsHandler');
var mongoose = require('mongoose');


exports.getusergrouplist = function getusergrouplist (request, response) {
    var checktoken = chatErrors.checktoken(request);
    if (checktoken) {
        response.status(checktoken.code).json({message: checktoken.message});
    }
    else {
        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
            } else {
                groupservice.getgrouplist(result._id).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            }
        });
    }
};


exports.getgroupinfo = function getgroupinfo (request, response) {
    var checktoken = chatErrors.checktoken(request);
    if (checktoken) {
        response.status(checktoken.code).json({message: checktoken.message});
    }
    else {
        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
            } else {
                groupservice.getinfo(request.params.groupid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            }
        });
    }
};

exports.getuserchatinfo = function getuserchatinfo (request, response) {
    var checktoken = chatErrors.checktoken(request);
    if (checktoken) {
        response.status(checktoken.code).json({message: checktoken.message});
    }
    else {
        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
            } else {
                groupservice.getchatinfo(result._id).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            }
        });
    }
};

exports.getgroupuserlist = function getgroupuserlist (request, response) {
    var checktoken = chatErrors.checktoken(request);
    if (checktoken) {
        response.status(checktoken.code).json({message: checktoken.message});
    }
    else {
        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
            } else {
                groupservice.getuserlist(request.params.groupid).then(function (error,result){
                    if(error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        response.json(result);
                    }
                });
            }
        });
    }
};


exports.newgroup = function newgroup (request, response){
    var Group = mongoose.model('Group');
    var Channel = mongoose.model('Channel');
    var checktoken = chatErrors.checktoken(request);
    if (checktoken) {
        response.status(checktoken.code).json({message: checktoken.message});
    }
    else {
        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
            } else {
                var userid = result._id;
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
            }
        });
    }

};