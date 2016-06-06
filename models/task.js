/**
 * Created by izaskun on 24/05/16.
 */



'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User  = require('./user');
var Hope      	= require('hope');

var AutoIncrement = require('mongoose-sequence');




var taskSchema = new Schema({

    numtask         : Number,
    subject         : { type: String, required: true },
    createdby       : { type: Schema.ObjectId, ref: 'User', required: true },
    datetime        : { type: Date, default: Date.now },
   /* tags            : [{ type: String, required: false }],*/

    /* si locaine puede ser para varios, puedes poner contributors */
    assignedto      : { type: Schema.ObjectId, ref: 'User', required: false },
    contributors    : [{ type: Schema.ObjectId, ref: 'User', required: false }],

    /* new = 0, in progress = 1, readyfortest = 2, closed =3 */
    status          : { type: String, default: 'New' },
    description     : { type: String, required: false },

    requirement     : {
        iocaine      : {type: Boolean, default: false },
        blocked      : {type: Boolean, required: false}
    }, /* Iocaine, bloqued */
    comments        : [{
                        comment: String,
                        _user:{ type: Schema.ObjectId, ref: 'User'},
                        created: { type: Date, default: Date.now }
                        }],

    attachments     : [{ type: String, required: false }] /* array of filename */



});


taskSchema.plugin(AutoIncrement, {inc_field: 'numTask'});


taskSchema.statics.createTask = function createTask (attributes) {

    var promise = new Hope.Promise();
    var Task = mongoose.model('Task', taskSchema);

    Task = new Task(attributes);
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


taskSchema.statics.searchPopulatedTasks = function searchPopulatedTasks (query, limit, page) {

    var promise = new Hope.Promise();


    /* skip is number of results that not show */
    if(typeof page === "undefined" || page == null) {
        page = 0;
    }
    if(typeof limit === "undefined" || limit == null) {
        limit = 0;
    }
    var skip = (page * limit);



    this.find(query).sort({datetime: -1})
        .skip(skip)
        .limit(limit)
        .populate('createdby assignedto contributors comments._user')
        .exec(function(error, value) {

            if(error){
                return promise.done(error, null);
            }
            else if (limit === 1){
                if (value.length === 0) {
                    error = {
                        code: 402,
                        message: "Task not found."
                    };
                    value = [];
                }
                else {
                    value = value[0].parse();
                }
            }
            else{
                value = value.map(function(elem,index) {

                    return elem.parse();
                });
                // Ordenamos x orden descendente
                value = value.reverse();

            }/* end else:: want multiple values & parse this values */

            // Devolvemos en order ascendente de fecha
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




taskSchema.statics.updateTaskyById = function updateTaskyById (id, update, options) {

    var promise = new Hope.Promise();

    this.findByIdAndUpdate(id, update, options,function(error, task) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (task){
                return promise.done(null, task);
            }
            else {
                var err = {
                    code   : 400,
                    message: 'Task not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};




taskSchema.methods.parse = function parse () {
    var task = this;


    var parseTask = {
        id          : task._id,
        num         : task.numTask,
        subject     : task.subject,
        createdby   : {
            id         : (task.createdby._id) ? task.createdby._id : task.createdby,
            username   : (task.createdby.username) ? task.createdby.username :  '',
            mail       : (task.createdby.mail) ? task.createdby.mail :  ''
        },
        /*tags        : task.tags,*/
        datetime    : task.datetime,
        status      : task.status,
        description : task.description,
        requirement : task.requirement,
        attachments : task.attachments


    };


    if(task.assignedto !== null && task.assignedto !== undefined){
        parseTask.assignedto = {
            id         : (task.assignedto._id) ? task.assignedto._id : task.assignedto,
            username   : (task.assignedto.username) ? task.assignedto.username :  '',
            mail       : (task.assignedto.mail) ? task.assignedto.mail :  ''
        };

    }
    else{
        parseTask.assignedto = {};
    }


    if(task.contributors !== null && task.contributors !== undefined){
        if(task.contributors.length){

            var contributor = {};
            for (var i = 0; i < task.contributors.length; i++) {
                contributor.id = (task.contributors[i]._id) ? task.contributors[i]._id : task.contributors[i];
                contributor.username = (task.contributors[i].username) ? task.contributors[i].username : '';
                contributor.mail = (task.contributors[i].mail) ? task.contributors[i].mail : '';

            }
            parseTask.contributors.push(contributor);
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
            var comment = {};
            for (var i = 0; i < task.comments.length; i++) {
                comment.comment = (task.comments[i].comment) ? task.comments[i].comment : '';
                comment.created = (task.comments[i].created) ? task.comments[i].created : Date.now;

                if(task.comments[i]._user !== undefined && task.comments[i]._user !== null){

                    comment.user = {
                        id         : (task.comments[i]._user._id) ? task.comments[i]._user._id : task.comments[i]._user,
                        username   : (task.comments[i]._user.username) ? task.comments[i]._user.username :  '',
                        mail       : (task.comments[i]._user.mail) ? task.comments[i]._user.mail :  ''
                    };


                }

                parseTask.comments.push(comment);


            }
        }
        else{
            parseTask.comments = [];
        }

    }
    else{

        parseTask.comments = [];
    }


    return parseTask;




};












module.exports = mongoose.model('Task', taskSchema);


