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



exports.checksprintexistsByIdCH = function checksprintexistsByIdCH (channelid, sprintid){
    var promise = new Hope.Promise();
    var Sprint = mongoose.model('Sprint');




    var query = { channel: channelid, _id: sprintid};

    Sprint.searchPopulateSprints (query, 1).then (function (error, sprint) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, sprint);
        }
    });
    return promise;
};






exports.newsprint = function newsprint(sprint){
    var promise = new Hope.Promise();
    var Sprint = mongoose.model('Sprint');

    Sprint.createSprint (sprint).then (function (error, newsprintresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            var query = { _id: newsprintresult._id};
            Sprint.searchPopulateSprints (query, 1).then (function (error, sprintresult) {
                if (error) {
                    return promise.done(error, null);
                }
                else {
                    return promise.done(null, sprintresult);
                }
            });

        }
    });
    return promise;
};



exports.updatesprint = function updatesprint(sprint, sprintid){
    var promise = new Hope.Promise();
    var Sprint = mongoose.model('Sprint');
    var options = {new: true};


    var update = {};

    if(sprint.name !== undefined &&  sprint.name !== null && sprint.name !== ''){
        update.name = sprint.name;

    }


    if(sprint.startdate !== undefined &&  sprint.startdate !== null && sprint.startdate !== ''){
        if(Object.prototype.toString.call(sprint.startdate) === '[object String]'){
            update.startdate = sprint.startdate;
        }


    }

    if(sprint.enddate !== undefined &&  sprint.enddate !== null && sprint.enddate !== ''){
        if(Object.prototype.toString.call(sprint.enddate) === '[object String]'){
            update.enddate = sprint.enddate;
        }


    }


    Sprint.updateSprintById (sprintid, update, options).then (function (error, newsprintresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            var query = { _id: newsprintresult._id};
            Sprint.searchPopulateSprints (query, 1).then (function (error, sprintresult) {
                if (error) {
                    return promise.done(error, null);
                }
                else {
                    return promise.done(null, sprintresult);
                }
            });

        }
    });
    return promise;
};
























exports.deletesprintById = function deletesprintById (sprintid){
    var promise = new Hope.Promise();
    var Sprint = mongoose.model('Sprint');

    /*var query = { _id: sprintid};*/



    Sprint.deleteSprintById(sprintid).then (function(error) {
        if (error) {
            return promise.done(error, null);

        }
        else {
            console.log("Sprint deleted successfully2");
            return promise.done(null, sprintid)
        }
    });



    return promise;
};





exports.deleteSprints = function deleteSprints (channelid){
    var promise = new Hope.Promise();
    var Sprint = mongoose.model('Sprint');


    console.log("entro en deletesprints");


    var query = {channel : channelid};


    Sprint.deleteSprints (query).then (function(error, removed) {
        if (error) {
            return promise.done(error, null);

        }
        else {

            return promise.done(null, removed);
        }
    });



    return promise;
};




