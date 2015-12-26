'use strict';

var User  = require('../models/user');
var Group  = require('../models/group');
var Channel  = require('../models/channel');
var Auth  = require('../helpers/authentication');
var channelservice  = require('../services/channel');
var chatErrors  = require('../helpers/chatErrorsHandler');
var mongoose = require('mongoose');


exports.newchannel = function newchannel (request, response) {
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
                channelservice.createnewchannel(request.body,result._id,request.params.groupid,request.body.channelName,request.body.channelType).then(function (error,channel){
                    if (error){
                        response.status(error.code).json({message: error.message});
                    }else {
                        response.json(channel.parse());
                    }
                });
            }
        });
    }
};