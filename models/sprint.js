/**
 * Created by izaskun on 24/05/16.
 */

'use strict';


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Userstory  = require('./userstory');
var Channel  = require('./channel');
var User  = require('./user');

var Hope      	= require('hope');
var AutoIncrement = require('mongoose-sequence');




var sprintSchema = new Schema({

    numSprint   : Number,
    name        : { type: String, required: true },
    createdby   : { type: Schema.ObjectId, ref: 'User', required: true },
    datetime    : { type: Date, default: Date.now },

    /* esta la metemos programaticamente, buscamos el ultimo sprint, su fecha de fin, esto en angular */
    startdate   :  { type: Date, default: Date.now },
    enddate  :  { type: Date, default: Date.now(+ Date.now + 7*24*60*60*1000)},
    /*userstories   : [{ type: Schema.ObjectId, ref: 'Userstory', required: false }],*/
    channel     : { type: Schema.ObjectId, ref: 'Channel', required: true }


});

sprintSchema.plugin(AutoIncrement, {inc_field: 'numSprint'});


/* metodos create, get y delete */


sprintSchema.statics.createSprint = function createSprint (attributes) {

    var promise = new Hope.Promise();
    var Sprint = mongoose.model('Sprint', sprintSchema);

    Sprint = new Sprint(attributes);
    Sprint.save(function (error, sprint) {
        if(error){


            console.log("hay error al guardar sprint");
            console.log(error);
            return promise.done(error, null);
        }else {
            console.log("no hay error al guardar el sprint");
            return promise.done(null, sprint);
        }
    });
    return promise;
};



sprintSchema.statics.searchSprints = function searchSprints (query, limit, page) {
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


    this.find(query)
        .skip(skip)
        .limit(limit)
        .exec(function(error, value) {
            if (limit === 1 && !error) {
                if (value.length === 0) {
                    error = {
                        code: 402,
                        message: "Sprint not found."
                    };

                }
                value = value[0];


            } else {

                value.forEach(function(sprint){

                    value2.push(sprint);

                });
                value= value2;
            }
            return promise.done(error, value);
        });

    return promise;
};




sprintSchema.statics.updateSprintById = function updateSprintById (id, update, options) {

    var promise = new Hope.Promise();

    this.findByIdAndUpdate(id, update, options,function(error, sprint) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            if (sprint){

                return promise.done(null, sprint);
            }
            else {
                var err = {
                    code   : 400,
                    message: 'Sprint not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};



sprintSchema.statics.searchPopulateSprints = function searchPopulateSprints (query, limit, page) {
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


    this.find(query)
        .skip(skip)
        .limit(limit)
        .populate('createdby')
        .sort({ startdate: -1 })
        .exec(function(error, value) {
        if (limit === 1 && !error) {
            if (value.length === 0) {
                error = {
                    code: 402,
                    message: "Sprint not found."
                };

                value = value[0];
            }
            else {
                value = value[0].parse();

            }


        } else {

                value=value.map(function(elem,index) {
                    return elem.parse();
                });
                // Ordenamos x orden descendente de fecha
                value=value.reverse();

        }
        return promise.done(error, value);
    });

    return promise;
};





sprintSchema.statics.deleteSprintById = function deleteSprintById (id) {

    var promise = new Hope.Promise();

    this.remove({_id:id},function(error) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            console.log("sprint deleted successfully");
            return promise.done(null, {message: 'Sprint deleted successfully'});
        }
    });
    return promise;
};



sprintSchema.statics.deleteSprints = function deleteSprints (query) {
    var promise = new Hope.Promise();
    this.remove(query,function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("Sprint deleted successfully");
            return promise.done(null, {message: 'Sprints deleted successfully'});
        }
    });
    return promise;
};



/* parse hay que mirar que nos interesa, quizas hacer populated */
sprintSchema.methods.parse = function parse () {
    var sprint = this;
    var parseSprint = {};



    parseSprint = {
        id          : sprint._id,
        name        : sprint.name,
        num         : sprint.numSprint,
        createdby   : {
            id         : (sprint.createdby._id) ? sprint.createdby._id : sprint.createdby,
            username   : (sprint.createdby.username) ? sprint.createdby.username :  '',
            mail       : (sprint.createdby.mail) ? sprint.createdby.mail :  ''
        },
        datetime    : sprint.datetime,
        startdate   : sprint.startdate,
        enddate  : sprint.enddate,
        /*userstories : sprint.userstories,*/
        channel     : sprint.channel


    };


/*
    if(sprint.userstories !== null && sprint.userstories !== undefined){
        if(sprint.userstories.length){
            for (var i = 0; i < userstory.tasks.length; i++) {
                parseSprint.userstories.push(sprint.userstories[i].parse());
            }
        }
        else{
            parseSprint.userstories = [];
        }

    }
    else{

        parseSprint.userstories = [];
    }*/


    return parseSprint;




};

/* esto sobra xq los parseos los cojo en el otro lado

sprintSchema.methods.parseForUserstory = function parseForUserstory () {
    var sprint = this;



    var parseSprint = {
        id          : sprint._id,
        title     : sprint.title,
        createdby   : sprint.createdby.parse(),
        datetime    : sprint.datetime,
        startdate   : sprint.startdate,
        endingdate  : sprint.endingdate,
        channel     : sprint.channel


    };


    return parseSprint;




};

*/






module.exports = mongoose.model('Sprint', sprintSchema);