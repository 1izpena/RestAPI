/**
 * Created by izaskun on 24/05/16.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Userstory  = require('./userstory');
var Channel  = require('./channel');
var User  = require('./user');


var Hope      	= require('hope');




var issueSchema = new Schema({

    subject     : { type: String, required: true },

    type        : { type: String, default: 'Bug' },     /* bug, question, enhancement */
    severity    : { type: String, default: 'Normal' },  /* low, normal, high */
    priority    : { type: String, default: 'Normal' },  /* wishlist, minor, normal, important, critical */

    createdby   : { type: Schema.ObjectId, ref: 'User', required: true },
    assignedto  : { type: Schema.ObjectId, ref: 'User', required: false },
    datetime    : { type: Date, default: Date.now },

    tags        : [{ type: String, required: false }],
    description : { type: String, required: false },

    /* probar si pongo default date.now me lo crea */
    comments        : [{
        comment: String,
        _user: { type: Schema.ObjectId, ref: 'User'},
        created: Date
    }],

    userstories   : [{ type: Schema.ObjectId, ref: 'Userstory', required: false }],
    attachments   : [{ type: String, required: false }], /* array of filename */
    channel       : { type: Schema.ObjectId, ref: 'Channel', required: true }




});


/* metodos create, get y delete */


issueSchema.statics.createIsssue = function createIsssue (attributes) {

    var promise = new Hope.Promise();
    var Issue = mongoose.model('Issue', issueSchema);

    Issue = new Issue(attributes);
    Issue.save(function (error, issue) {
        if(error){


            console.log("hay error al guardar issue");
            console.log(error);
            return promise.done(error, null);
        }else {
            return promise.done(null, issue);
        }
    });
    return promise;
};


issueSchema.statics.getIssues = function getIssues (query, limit, page) {
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
                    message: "Issue not found."
                };
            }
            value = value[0];

        } else {

            value.forEach(function(issue){

                issue = issue.parse();
                value2.push(issue);

            });
            value= value2;
        } /* end else:: want multiple values & parse this values */



        return promise.done(error, value);
    });

    return promise;
};





issueSchema.statics.deleteIssueById = function deleteIssueById (id) {
    var promise = new Hope.Promise();
    this.remove({_id:id},function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("issue deleted successfully");
            return promise.done(null, {message: 'Issue deleted successfully'});
        }
    });
    return promise;
};



issueSchema.statics.deleteIssues = function deleteIssues (query) {
    var promise = new Hope.Promise();
    this.remove(query,function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("Issues deleted successfully");
            return promise.done(null, {message: 'Issues deleted successfully'});
        }
    });
    return promise;
};



/* parse hay que mirar que nos interesa, quizas hacer populated */

issueSchema.methods.parse = function parse () {
    var issue = this;


    var parseIssue = {
        id          : issue._id,
        /* lo queremos para mostrarlo o no en el backlog,
         * luego no necesito mas que saber si es vacio o no,
         * de momento pasamos el array */
        subject     : issue.subject,
        type        : issue.type,
        severity    : issue.severity,
        priority    : issue.priority,
        createdby   : issue.createdby.parse(),
        assignedto  : issue.assignedto.parse(),
        datetime    : issue.datetime,
        tags        : issue.tags,
        description : issue.description,
        attachments : issue.attachments,
        channel     : issue.channel

    };


    if(issue.userstories !== null && issue.userstories !== undefined){
        if(issue.userstories.length > 0){


            for (var i = 0; i < issue.userstories.length; i++) {

                parseIssue.userstories.push(issue.userstories[i].parse());

            }
        }
        else{
            parseIssue.userstories = [];
        }

    }
    else{

        parseIssue.userstories = [];
    }



    if(issue.comments !== null && issue.comments !== undefined){
        if(issue.comments.length > 0){


            for (var i = 0; i < issue.comments.length; i++) {

                if(issue.comments[i]._user !== undefined && issue.comments[i]._user !== null){

                    issue.comments[i]._user = issue.comments[i]._user.parse();
                    parseIssue.comments.push(issue.comments[i]);
                }

            }
        }
        else{
            parseIssue.comments = [];
        }

    }
    else{

        parseIssue.comments = [];
    }




    return parseIssue;




};






module.exports = mongoose.model('Issue', issueSchema);
