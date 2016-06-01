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

/*
*
*
*
 var options = {new: true};
 var query = {"groupName": groupName};
 Group.updategroup (groupid,query,options).then (function (error,group){
 if (error){
 console.log("error update");
 return promise.done(error,null);
 }
 else{
 console.log("ok update");
 var Group = mongoose.model('Group');
 Group.parsepopulated(userid,groupid).then(function (error, group) {
 if (error){
 return promise.done(error,null);
 }
 else {
 return promise.done(null, group);
 }
 });
 }
 });
 return promise;
 };
*
*
*
*
*
*
*
*
*
* */
exports.updateuserstoryById = function updateuserstoryById(userstoryid, userstory, codefield){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');
    var options = {new: true};


    var update = {};

    if(codefield == 1){ /*voters*/
        update.voters = userstory.voters;

    }
    else if(codefield == 2){ /*point*/
        update.point = userstory.point;

    }
    else if(codefield == 3){ /*attachments*/
        update.attachments = userstory.attachments;

    }
    else if(codefield == 4){ /*tasks*/
        update.tasks = userstory.tasks;

    }
    else if(codefield == 5){ /*tags*/
        update.tags = userstory.tags;

    }
    else if(codefield == 6){ /*description*/
        update.description = userstory.description;

    }
    else if(codefield == 7){ /*requirement*/
        update.requirement = userstory.requirement;

    }
    else if(codefield == 8){ /*subject*/
        update.subject = userstory.subject;

    }
    else{ /* sprint */
        update.sprint = userstory.sprint;

    }


    Userstory.updateUserstoryById (userstoryid, update, options).then (function (error, newuserstoryresult) {
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