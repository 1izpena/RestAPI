'use strict';

var Group  = require('../models/group');
var User  = require('../models/user');
var Channel  = require('../models/channel');
var Auth  = require('../helpers/authentication');

exports.newchannel = function newchannel (request, response) {
    var user='';
    var group='';
    var id = request.body.groupid;
    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        } else {
            user = result.parse();
            Channel.newchannel(request.body).then(function newchannel (error, result) {
                if (error) {
                    response.status(error.code).json({message: error.message});
                } else {
                    var channel = result.parse();
                    var channels = [];
                    channels.push(channel.id);
                    var update = {$push:{"channels":channel.id}};
                    var options = {multi: true};
                    Group.updategroup(id,update,options).then(function updategroup (error, result){
                        if(error){
                            response.status(error.code).json({message: error.message});
                        }else{
                            //si el canal es privado actualizamos en el usuario añadiendo nuevo grupo con canal
                            if (channel.channelType==='PRIVATE'){
                                group = result.parse();
                                var privatechannels = [];
                                privatechannels.push(channel.id);
                                var update = '';
                                if (user.groups===undefined){
                                    var groups = [];
                                    groups.push({"_group":group.id,"privateChannels":privatechannels});
                                    update = {"groups":groups};
                                } else {
                                    var dat = {"_group":group.id,"privateChannels":privatechannels};
                                    user.groups.push(dat);
                                    update = {"groups":user.groups};
                                }
                                var options = {multi: true};
                                User.updateuser(user.id,update,options).then(function updateuser (error){
                                    if(error){
                                        response.status(error.code).json({message: error.message});
                                    }else{
                                        response.json(channel);
                                    }
                                });
                            }else {
                                response.json(channel);
                            }

                        }
                    });
                }
            });
        }
    });
};