/**
 * Created by izaskun on 25/05/16.
 */


var mongoose = require('mongoose');
var Hope  = require('hope');
var Userstory  = require('../models/userstory');




/* probar que funcione */
exports.newuserstory = function newuserstory(userstory){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');

    Userstory.createUserstory (userstory).then (function (error, newuserstory) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            var query = { _id: newuserstory._id};
            Userstory.searchPopulatedUserstories (query).then (function (error, userstory) {
                if (error) {
                    return promise.done(error, null);
                }
                else {
                    return promise.done(null, userstory);
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