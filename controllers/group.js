'use strict';

var Group  = require('../models/group');
var Channel  = require('../models/channel');
var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var groupservice  = require('../services/groupchannelservice');

exports.newgroup = function newgroup (request, response) {
    //sacar quien es el usuario que crea el grupo, y si va bien, llamamos a crear grupo
    var group = '';
    var groupid = '';
    var checktoken = groupservice.checktoken(request);
    if (checktoken) {
        response.status(checktoken.code).json({message: checktoken.message});
    }
    else {
        Auth(request, response).then(function(error, result) {
            if (error) {
                response.status(error.code).json({message: error.message});
            } else {
                var userid = result._id;
                var existeGrupo = groupservice.checkgroupnameunique(userid,request.body.groupname);
                if (existeGrupo){
                    response.status(existeGrupo.code).json({message: existeGrupo.message});
                }else {
                    var ats = {
                        groupName: request.body.groupName,
                        _admin: userid
                    };
                    Group.newgroup(ats).then(function newgroup (error, result){
                        if (error){
                            response.status(error.code).json({message: error.message});
                        }else {
                            var devolver = result.parse();
                            var groupid = result._id;
                            var ats = {channelName:"GENERAL",channelType:"PUBLIC"};
                            Channel.newchannel (ats,userid,groupid).then(function newchannel (error, result){
                                if (error){
                                    response.status(error.code).json({message: error.message});
                                } else {
                                    //buscamos el grupo
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

            }
        });
    }
};