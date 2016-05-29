/**
 * Created by izaskun on 29/05/16.
 */

var mongoose = require('mongoose');
var Hope  = require('hope');
var Sprint  = require('../models/sprint');


exports.getsprints = function getsprints (channelid){
    var promise = new Hope.Promise();
    var Sprint = mongoose.model('Sprint');

    var query = { channel: channelid};

    Sprint.searchPopulateSprints (query).then (function (error, sprints) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, sprints);
        }
    });
    return promise;
};