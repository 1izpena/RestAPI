'use strict';

var User  = require('../models/user');
var Group  = require('../models/group');
var Channel  = require('../models/channel');
var Auth  = require('../helpers/authentication');

var groupservice  = require('../services/groupchannelservice');

exports.newchannel = function newchannel (request, response) {
    var groupid='';
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
                var existeGrupo = groupservice.checkchannelnameunique(userid,request.params.groupname,request.body.channelName);
                if (existeGrupo.error==''){
                    response.status(existeGrupo.error.code).json({message: existeGrupo.error.message});
                }else {
                    groupid = existeGrupo.groupid;
                    Channel.newchannel (request.body,userid,groupid).then(function newchannel (error, result){
                        if (error){
                            response.status(error.code).json({message: error.message});
                        } else {
                            response.json(result);
                            console.log ("resultado... " + result);
                        }
                    });
                }

            }
        });
    }
};