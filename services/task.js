/**
 * Created by izaskun on 2/06/16.
 */

var mongoose = require('mongoose');
var Hope  = require('hope');
var Task  = require('../models/task');




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