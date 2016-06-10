/**
 * Created by izaskun on 2/06/16.
 */

var mongoose = require('mongoose');
var Hope  = require('hope');
var Task  = require('../models/task');
var async = require("async");



exports.deletetask = function deletetask(taskid){
    var promise = new Hope.Promise();
    var Task = mongoose.model('Task');


    var query = { _id: taskid};
    Task.searchPopulatedTasks (query, 1).then (function (error, taskresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            Task.deleteTaskById (taskid).then (function(error) {
                if (error) {
                    return promise.done(error, null);

                }
                else {
                    console.log("task deleted successfully2");
                    return promise.done(null, taskresult);
                }
            });



        }
    });

    return promise;



};







exports.newtask = function newtask(task){
    var promise = new Hope.Promise();
    var Task = mongoose.model('Task');

    Task.createTask (task).then (function (error, newtaskresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            /*parseamos la tarea, la necesitamos para el mensaje */

            var query = { _id: newtaskresult._id};
            Task.searchPopulatedTasks (query, 1).then (function (error, taskresult) {
                if (error) {
                    return promise.done(error, null);
                }
                else {
                    return promise.done(null, taskresult);
                }
            });


        }
    });
    return promise;
};




exports.searchtask = function searchtask(query){
    var promise = new Hope.Promise();
    var Task = mongoose.model('Task');

    Task.searchPopulatedTasks (query).then (function (error, oldtaskresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            return promise.done(null, oldtaskresult);



        }
    });
    return promise;
};



/*
* function updateTask (id, update, options) {
*
* */

exports.updatetask = function updatetask(taskid, num, fieldnewvalue){
    var promise = new Hope.Promise();
    var Task = mongoose.model('Task');


    var update = {};
    var options = {new: true};



    if(num == 1){
        update.assignedto = fieldnewvalue;

    }
    else if(num == 7){
        update.subject = fieldnewvalue;

    }
    else if(num == 5){
        update.description = fieldnewvalue;

    }
    else if(num == 6){
        update.requirement = fieldnewvalue;

    }
    else if(num == 8){
        update.status = fieldnewvalue;

    }
    else if(num == 9){
        /* unassigned  /* db.users.update({},{$unset: {githubtoken:1}},false,true)*/
        update = {$unset: {assignedto:1}};
    }
    else if(num == 2){

        /*hacer 1 specie de pull */
        update = {$push: {contributors: fieldnewvalue}};


    }
    else if(num == 10){

        /*hacer 1 specie de pull */
        update = {$pull: {contributors: fieldnewvalue.id}};


    }
    else if(num == 4){
        update = {$push: {comments: fieldnewvalue}};


    }
    else if(num == 11){
        update = {$pull: {comments: {_id: fieldnewvalue}}};

    }



    Task.updateTaskyById (taskid, update, options).then (function (error, newtaskresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            var query = { _id: newtaskresult._id};
            Task.searchPopulatedTasks (query, 1).then (function (error, taskresult) {
                if (error) {
                    return promise.done(error, null);
                }
                else {
                    return promise.done(null, taskresult);
                }
            });

        }
    });
    return promise;
};