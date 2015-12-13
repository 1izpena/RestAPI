'use strict';

var Group  = require('../models/group');
var Channel  = require('../models/channel');
var Auth  = require('../helpers/authentication');
var User  = require('../models/user');

//Crea un grupo nuevo con los atributos que le llegan de la request.
exports.newgroup = function newgroup (request, response) {
    //sacar quien es el usuario que crea el grupo, y si va bien, llamamos a crear grupo
    var group = '';
    Auth(request, response).then(function(error, result) {
        if (error) {
            /* nunca va a entrar */
            response.status(error.code).json({message: error.message});
        } else {
            /* devuelve el usuario entero */
            var user = result.parse();
            Group.newgroup(request.body).then(function newgroup (error, result) {
                if (error) {
                    response.status(error.code).json({message: error.message});
                } else {
                    group = result.parse();
                    Channel.newchannel({channelName:"GENERAL",channelType:"PUBLIC"}).then(function newchannel (error, result) {
                        if (error) {
                            response.status(error.code).json({message: error.message});
                        } else {
                            var channel = result.parse();
                            var channels = [];
                            channels.push(channel.id);
                            var update = {"_admin":user.id,"channels":channels};
                            var options = {multi: true};
                            Group.updategroup(group.id,update,options).then(function updategroup (error, result){
                                if(error){
                                    response.status(error.code).json({message: error.message});
                                }else{
                                    //actualizamos en el usuario añadiendo nuevo grupo con canal
                                    group = result.parse();
                                    var privatechannels = [];
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
                                            //buscamos el grupo
                                            var limit = 1;
                                            var query = {"_id":group.id};
                                            Group.search(query, limit).then(function search (error, result){
                                                if(error){
                                                    response.status(error.code).json({message: error.message});
                                                }else{
                                                    response.json(result.parse());
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
    });
};