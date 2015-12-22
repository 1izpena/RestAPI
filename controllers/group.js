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
                groupservice.obtaingroupid(result._id, request.params.groupname).then(function (error,result) {
                    if (error) {
                        response.status(error.code).json({message: error.message});
                    } else {
                        groupservice.getinfo(result).then(function (error,result){
                            if(error){
                                response.status(error.code).json({message: error.message});
                            }else{
                                response.json(result);
                            }
                        });
                    }
                });

            }
        });
    }
};


exports.newgroup = function newgroup (request, response){
    var groupid='';
    var userid = '';
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
                userid = result._id;
                groupservice.checkgroupnameunique(result._id,request.body.groupName).then(function (error,result){
                    if (error){
                        response.status(error.code).json({message: error.message});
                    }else {
                        var ats = {
                            groupName: request.body.groupName,
                            _admin: result._id
                        };
                        Group.creategroup(ats,userid).then(function creategroup (error, result){
                            if (error){
                                response.status(error.code).json({message: error.message});
                            }else {
                                groupid = result._id;
                                var ats = {channelName:"GENERAL",channelType:"PUBLIC"};
                                Channel.createchannel (ats,userid,groupid).then(function createchannel (error, result){
                                    if (error){
                                        response.status(error.code).json({message: error.message});
                                    } else {
                                        var limit = 1;
                                        var query = {"_id":groupid};
                                        Group.search(query, limit).then(function search (error, group){
                                            if(error){
                                                response.status(error.code).json({message: error.message});
                                            }else{
                                                response.json(group.parse());
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

};