/**
 * Created by izaskun on 24/05/16.
 */


'use strict';


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AutoIncrement = require('mongoose-sequence');

var User  = require('./user');
var Task  = require('./task');
var Sprint  = require('./sprint');
var Channel = require('./channel');


var Hope      	= require('hope');

/* faltan presave */


var userstorySchema = new Schema({

    /*num: Number,*/


    subject     : { type: String, required: true },
    createdby   : { type: Schema.ObjectId, ref: 'User', required: true },
    datetime    : { type: Date, default: Date.now },
    sprint      : { type: Schema.ObjectId, ref: 'Sprint', required: false },
    voters      : [{ type: Schema.ObjectId, ref: 'User', required: false }],
    /* puedes hacerlo x rol*/
    points      : {
        ux      : {type: Number, required: false},
        design  : {type: Number, required: false},
        front   : {type: Number, required: false},
        back    : {type: Number, required: false},
    },
    attachments : [{ type: String, required: false }],
    tasks       : [{ type: Schema.ObjectId, ref: 'Task', required: false }],
    tags        : [{ type: String, required: false }],
    /* esto que lo haga solo, cuando metas 1 tarea, se actualiza el status */
    /* normal, con espacios y en minus mayus ::NEW, IN PROGRESS, Ready for test, DONE */
    status      : { type: String, default: 'New' },
    description : { type: String, required: false },
    /*["Team Requirement", "Client Requirement", "Blocked" ]*/
    /*requirements : [{ type: String, required: false }],*/
    requirements:{
        team      : {type: Boolean, default: false },
        client    : {type: Boolean, required: false},
        blocked   : {type: Boolean, required: false}
    },

    /* con el id de sobra */
    channel     : { type: Schema.ObjectId, ref: 'Channel', required: true },
    num         : Number



});

userstorySchema.plugin(AutoIncrement, {inc_field: 'num'});


/* metodos create, get y delete */
userstorySchema.statics.createUserstory = function createUserstory (attributes) {

    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory', userstorySchema);

    Userstory = new Userstory(attributes);
    Userstory.save(function (error, userstory) {
        if(error){


            console.log("hay error al guardar userstory");
            console.log(error);
            return promise.done(error, null);
        }else {
            return promise.done(null, userstory);
        }
    });
    return promise;
};


userstorySchema.statics.getUserstories = function getUserstories (query, limit, page) {
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
                    message: "Userstory not found."
                };
            }
            value = value[0];

        } else {

            value.forEach(function(userstory){

                userstory = userstory.parse();
                value2.push(userstory);

            });
            value= value2;
        } /* end else:: want multiple values & parse this values */



        return promise.done(error, value);
    });

    return promise;
};





userstorySchema.statics.deleteUserstoryById = function deleteUserstoryById (id) {
    var promise = new Hope.Promise();
    this.remove({_id:id},function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("userstory deleted successfully");
            return promise.done(null, {message: 'Userstory deleted successfully'});
        }
    });
    return promise;
};



userstorySchema.statics.deleteUserstories = function deleteUserstories (query) {
    var promise = new Hope.Promise();
    this.remove(query,function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("Userstories deleted successfully");
            return promise.done(null, {message: 'Userstories deleted successfully'});
        }
    });
    return promise;
};



/* parse hay que mirar que nos interesa, quizas hacer populated */

userstorySchema.methods.parse = function parse () {
    var userstory = this;


    /* mirar que devuelve esto */
    var parseUserstory = {
        id          : userstory._id,
        num         : userstory.num,
        subject     : userstory.subject,
        createdby   : userstory.createdby.parse(),
        datetime    : userstory.datetime,
        sprint      : userstory.sprint.parseForUserstory(),
        tags        : userstory.tags,
        points      : userstory.points,
        status      : userstory.status,
        description : userstory.description,
        requirements: userstory.requirements,
        attachments : userstory.attachments,
        channel     : userstory.channel


    };

    if(userstory.tasks !== null && userstory.tasks !== undefined){
        if(userstory.tasks.length){

            for (var i = 0; i < userstory.tasks.length; i++) {
                parseUserstory.tasks.push(userstory.tasks[i].parse());
            }
        }
        else{
            parseUserstory.tasks = [];
        }

    }
    else{

        parseUserstory.tasks = [];
    }

    if(userstory.voters !== null && userstory.voters !== undefined){
        if(userstory.voters.length){

            for (var i = 0; i < userstory.voters.length; i++) {
                parseUserstory.voters.push(userstory.voters[i].parse());
            }
        }
        else{
            parseUserstory.tasks = [];
        }

    }
    else{

        parseUserstory.tasks = [];
    }



    return parseUserstory;




};






module.exports = mongoose.model('Userstory', userstorySchema);