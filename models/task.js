/**
 * Created by izaskun on 24/05/16.
 */



'use strict';


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User  = require('./user');
var Hope      	= require('hope');




var taskSchema = new Schema({

    /* las task siempre pertenecen de 1 userstory, solas como tal no las vas a ver */


    subject         : { type: String, required: true },
    createdby       : { type: Schema.ObjectId, ref: 'User', required: true },
    datetime        : { type: Date, default: Date.now },
    /* si locaine puede ser para varios, puedes poner contributors */
    assignedto      : { type: Schema.ObjectId, ref: 'User', required: false },
    contributors    : [{ type: Schema.ObjectId, ref: 'User', required: false }],

    tags            : [{ type: String, required: false }], /* esto no se si dejarlo */
    status          : { type: String, default: 'NEW' },
    description     : { type: String, required: false },

    requirement     : { type: String, required: false }, /* iocained, bloqued */
    comments        : [{
                        comment: String,
                        _user:{ type: Schema.ObjectId, ref: 'User'},
                        created: Date
                        }],

    attachments     : [{ type: String, required: false }] /* array of filename */

    /* puedo meter historial?? */
    /**
    activity        : [{
        subject: String,
        _user:{ type: Schema.ObjectId, ref: 'User'},
        datetime: Date
    }],*/


});




taskSchema.statics.createTask = function createTask (attributes) {

    var promise = new Hope.Promise();

    var Task = mongoose.model('Task', taskSchema);

    Task = new Userstory(attributes);
    Task.save(function (error, task) {
        if(error){


            console.log("hay error al guardar task");
            console.log(error);
            return promise.done(error, null);
        }else {
            return promise.done(null, task);
        }

    });
    return promise;
};


taskSchema.statics.getTasks = function getTasks (query, limit, page) {
    var promise = new Hope.Promise();
    var value2 = [];


    /* skip is number of results that not show */
    if(typeof page === "undefined" || page == null) {
        page = 0;
    }
    if(typeof limit === "undefined" || limit == null) {
        limit = 0;
    }

    var skip = (page * limit);


    this.find(query).skip(skip).limit(limit).exec(function(error, value) {
        if (limit === 1 && !error) {
            if (value.length === 0) {
                error = {
                    code: 402,
                    message: "Task not found."
                };
            }
            value = value[0];

        } else {

            value.forEach(function(task){

                task = task.parse();
                value2.push(task);

            });
            value= value2;
        } /* end else:: want multiple values & parse this values */



        return promise.done(error, value);
    });

    return promise;
};





taskSchema.statics.deleteTaskById = function deleteTaskById (id) {
    var promise = new Hope.Promise();
    this.remove({_id:id},function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("task deleted successfully");
            return promise.done(null, {message: 'Task deleted successfully'});
        }
    });
    return promise;
};



taskSchema.statics.deleteTasks = function deleteTasks (query) {
    var promise = new Hope.Promise();
    this.remove(query,function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("tasks deleted successfully");
            return promise.done(null, {message: 'Tasks deleted successfully'});
        }
    });
    return promise;
};



taskSchema.methods.parse = function parse () {
    var task = this;


    var parseTask = {
        id          : task._id,
        subject     : task.subject,
        createdby   : task.createdby.parse(),
        datetime    : task.datetime,
        assignedto  : task.assignedto.parse(),
        status      : task.status,
        tags        : task.tags,
        description : task.description,
        requirement : task.requirement,
        attachments : task.attachments


    };

    if(task.contributors !== null && task.contributors !== undefined){
        if(task.contributors.length){

            for (var i = 0; i < task.contributors.length; i++) {

                parseTask.contributors.push(task.contributors[i].parse());
            }
        }
        else{
            parseTask.contributors = [];
        }

    }
    else{

        parseTask.contributors = [];
    }


    if(task.comments !== null && task.comments !== undefined){
        if(task.comments.length > 0){


            for (var i = 0; i < issue.comments.length; i++) {

                if(task.comments[i]._user !== undefined && task.comments[i]._user !== null){

                    task.comments[i]._user = task.comments[i]._user.parse();
                    parseTask.comments.push(task.comments[i]);
                }

            }
        }
        else{
            taskContributors.comments = [];
        }

    }
    else{

        taskContributors.comments = [];
    }





    return parseTask;




};












module.exports = mongoose.model('Task', taskSchema);


