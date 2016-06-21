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



/* añadir 1 task en el userstory */

exports.updateuserstoryTaskById = function updateuserstoryTaskById(userstoryid, taskid){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');
    var options = {new: true};

    var update = { $push: { "tasks": taskid} };


    /* si no lo encuentra me avisa */
    /* reutilizamos el socket del userstory cada vez que se actualice la tarea */
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





exports.deletetaskFromUS = function deletetaskFromUS(userstoryid, taskid){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');

    var options = {new: true};

    var update = { $pull: { "tasks": taskid} };


    Userstory.updateUserstoryById (userstoryid, update, options).then (function (error, newuserstoryresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            return promise.done(null, newuserstoryresult);

        }
    });
    return promise;






};








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
    else if(codefield == 9){ /* sprint,es 1 id */
        update.sprint = userstory.sprint;

    }
    else if(codefield == 10){
        update = {$unset: {sprint:1}};

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




exports.updateuserstoriesFromSprint = function updateuserstoriesFromSprint(sprintid){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');

    var options = {multi: true};
    var update = {$unset: {sprint:1}};
    var query = {sprint: sprintid};

    /* se supone que raw podria devolverme el numero de documentos modificados */


    Userstory.updateUserstoryByQuery (query,update, options).then (function (error, raw) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            console.log("esto vale raw en services ************");
            console.log(raw);
            return promise.done(null, raw);
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





exports.getuserstoryByIdWithInPopulate = function getuserstoryByIdWithInPopulate (channelid, userstoryid){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');

    var query = { channel: channelid, _id:userstoryid};

    Userstory.searchUserstories (query,1).then (function (error, userstory) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, userstory);
        }
    });
    return promise;
};









exports.getuserstoryById = function getuserstoryById (channelid, userstoryid){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');

    var query = { channel: channelid, _id:userstoryid};

    Userstory.searchPopulatedUserstories (query,1).then (function (error, userstories) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, userstories);
        }
    });
    return promise;
};


exports.getuserstoryByIdwithquery = function getuserstoryByIdwithquery (query){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');


    Userstory.searchPopulatedUserstories (query,1).then (function (error, userstories) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, userstories);
        }
    });
    return promise;
};








exports.deleteuserstoryById = function deleteuserstoryById (userstoryid){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');

    var query = { _id: userstoryid};



    Userstory.deleteUserstoryById (userstoryid).then (function(error) {
        if (error) {
            return promise.done(error, null);

        }
        else {
            console.log("US deleted successfully2");
            return promise.done(null, userstoryid)
        }
    });



    return promise;
};




exports.deleteTaskByIdRemovedUS = function deleteTaskByIdRemovedUS(userstoryexists){

    var promise = new Hope.Promise();
    var Task = mongoose.model('Task');


    var query = {_id:{$in:userstoryexists.tasks}};

    Task.deleteTasks (query).then (function(error) {
        if (error) {
            return promise.done(error, null);
        }


        else {
            return promise.done(null,userstoryexists);
        }
    });



    return promise;



};




exports.deleteUserstories = function deleteUserstories (channelid){
    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory');

    var query = {channel : channelid};


    Userstory.deleteUserstories (query).then (function(error, removed) {
        if (error) {
            return promise.done(error, null);

        }
        else {

            return promise.done(null, removed);
        }
    });



    return promise;
};









