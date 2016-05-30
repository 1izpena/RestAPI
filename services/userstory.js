/**
 * Created by izaskun on 25/05/16.
 */


var mongoose = require('mongoose');
var Hope  = require('hope');
var Userstory  = require('../models/userstory');




exports.newuserstory = function newuserstory(userstory){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');

    Userstory.createUserstory (userstory).then (function (error, newuserstoryresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            var query = { _id: newuserstoryresult._id};
            Userstory.searchPopulatedUserstories (query, 1).then (function (error, userstoryresult) {
                if (error) {
                    return promise.done(error, null);
                }
                else {
                    return promise.done(null, userstoryresult);
                }
            });

        }
    });
    return promise;
};



exports.getuserstories = function getuserstories (channelid){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');

    var query = { channel: channelid};

    Userstory.searchPopulatedUserstories (query).then (function (error, userstories) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, userstories);
        }
    });
    return promise;
};