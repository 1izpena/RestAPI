'use strict';

var User  = require('../models/user');
var Group  = require('../models/group');
var Channel  = require('../models/channel');
var Auth  = require('../helpers/authentication');
var channelservice  = require('../services/channel');
var chatErrors  = require('../helpers/chatErrorsHandler');
var mongoose = require('mongoose');

exports.newchannel = function newchannel (request, response) {
    var groupid='';
    var Channel = mongoose.model('Channel');
    var Group = mongoose.model('Group');
    var User = mongoose.model('User');
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
                channelservice.obtaingroupid(userid, request.params.groupname).then(function (error,result) {
                    if (error){
                        response.status(error.code).json({message: error.message});
                    }else{
                        groupid=result;
                        channelservice.chechchannelnameunique(userid,groupid,request.body.channelName,request.body.channelType).then(function (error,result){
                            if (error){
                                response.status(error.code).json({message: error.message});
                            }else {
                                Channel.createchannel (request.body,userid,groupid).then(function createchannel (error, result){
                                    if (error){
                                        response.status(error.code).json({message: error.message});
                                    } else {
                                        var channel = result;
                                        if (request.body.channelType == "PRIVADO"){
                                            console.log("actualiza a usuario por ser canal privado");
                                            channelservice.updateuserchannelprivatelist(userid,groupid, result._id).then(function(error,result){
                                                if (error){
                                                    response.status(error.code).json({message: error.message});
                                                }else{

                                                }
                                            });
                                        }
                                        console.log("HA HECHO TOODOOO BIENNNN");
                                        response.json(channel.parse());
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