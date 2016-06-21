/**
 * Created by izaskun on 24/05/16.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Userstory  = require('./userstory');
var Task  = require('./task');
var Channel  = require('./channel');
var User  = require('./user');


var Hope      	= require('hope');
var AutoIncrement = require('mongoose-sequence');




var issueSchema = new Schema({

    numissue    : Number,
    subject     : { type: String, required: true },

    type        : { type: String, default: 'Bug', enum: ['Bug', 'Question', 'Enhancement']},
    severity    : { type: String, default: 'Normal', enum: ['Wishlist', 'Minor', 'Normal', 'Important', 'Critical'] },
    priority    : { type: String, default: 'Normal', enum: ['Low', 'Normal', 'High'] },
    voters      : [{ type: Schema.ObjectId, ref: 'User', required: false }],
    status      : { type: String, default: 'New', enum: ['New', 'In progress', 'Closed', 'Ready for test'] },

    createdby   : { type: Schema.ObjectId, ref: 'User', required: true },
    assignedto  : { type: Schema.ObjectId, ref: 'User', required: false },
    datetime    : { type: Date, default: Date.now },

    description : { type: String, required: false },

    /* probar si pongo default date.now me lo crea */
    comments        : [{
        comment: String,
        _user: { type: Schema.ObjectId, ref: 'User'},
        created: { type: Date, default: Date.now },
    }],

    userstories   : [{ type: Schema.ObjectId, ref: 'Userstory', required: false }],
    attachments   : [{ type: String, required: false }], /* array of filename */
    channel       : { type: Schema.ObjectId, ref: 'Channel', required: true }




});

issueSchema.plugin(AutoIncrement, {inc_field: 'numissue'});



/* metodos create, get y delete */
issueSchema.statics.createIssue = function createIsssue (attributes) {

    var promise = new Hope.Promise();
    var Issue = mongoose.model('Issue', issueSchema);

    Issue = new Issue(attributes);
    Issue.save(function (error, issue) {
        if(error){


            console.log("hay error al guardar issue");
            console.log(error);
            return promise.done(error, null);
        }
        else {
            return promise.done(null, issue);
        }
    });
    return promise;
};


issueSchema.statics.searchIssues = function searchIssues (query, limit, page) {
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
        .populate('createdby assignedto comments._user userstories')
        .exec(function(error, value) {
        if (limit === 1 && !error) {
            if (value.length === 0) {

                error = {
                    code: 402,
                    message: "Issue not found."
                };

                value = value[0];
            }
            else{

                value = value[0].parse();

            }


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
    this.remove({_id : id },function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("Issue deleted successfully");
            return promise.done(null, {message: 'Issue deleted successfully'});
        }
    });
    return promise;
};



issueSchema.statics.deleteIssues = function deleteIssues (query) {
    var promise = new Hope.Promise();
    this.remove(query,function(error, removed) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("Issues deleted successfully");
            return promise.done(null, removed);
        }
    });
    return promise;
};



issueSchema.statics.updateIssuesByQuery = function updateIssuesByQuery (query, update, options) {

    var promise = new Hope.Promise();

    this.update(query, update, options,function(error, raw) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(error, raw);
        }
    });
    return promise;
};










issueSchema.statics.updateIssueyById = function updateIssueyById (id, update, options) {

    var promise = new Hope.Promise();

    this.findByIdAndUpdate(id, update, options,function(error, issue) {
        if (error) {
            console.log("error");
            console.log(error);
            return promise.done(error, null);
        }
        else {
            if (issue){
                return promise.done(null, issue);
            }
            else {
                var err = {
                    code   : 400,
                    message: 'Issue not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};










/* parse hay que mirar que nos interesa, quizas hacer populated */
issueSchema.methods.parse = function parse () {
    var issue = this;


    var parseIssue = {
        id          : issue._id,
        num         : issue.numissue,
        subject     : issue.subject,
        type        : issue.type,
        severity    : issue.severity,
        priority    : issue.priority,
        voters      : issue.voters,
        status      : issue.status,
        createdby   : {
            id         : (issue.createdby._id) ? issue.createdby._id : issue.createdby,
            username   : (issue.createdby.username) ? issue.createdby.username :  '',
            mail       : (issue.createdby.mail) ? issue.createdby.mail :  ''
        },
        datetime    : issue.datetime,
        description : issue.description,
        userstories : issue.userstories,
        attachments : issue.attachments,
        channel     : issue.channel

    };


    if(issue.assignedto !== null && issue.assignedto !== undefined){
        parseIssue.assignedto = {
            id         : (issue.assignedto._id) ? issue.assignedto._id : issue.assignedto,
            username   : (issue.assignedto.username) ? issue.assignedto.username :  '',
            mail       : (issue.assignedto.mail) ? issue.assignedto.mail :  ''
        };

    }
    else{
        parseIssue.assignedto = {};
    }


    parseIssue.userstories = [];
    if(issue.userstories !== null && issue.userstories !== undefined){
        if(issue.userstories.length > 0){


            for (var i = 0; i < issue.userstories.length; i++) {
                var userstory = {};

                userstory.id = (issue.userstories[i]._id) ? issue.userstories[i]._id : issue.userstories[i];
                userstory.num = (issue.userstories[i].num) ? issue.userstories[i].num : -1;
                userstory.subject = (issue.userstories[i].subject) ? issue.userstories[i].subject : '';

                parseIssue.userstories.push(userstory);


            }
        }

    }






    parseIssue.comments = [];
    if(issue.comments !== null && issue.comments !== undefined){
        if(issue.comments.length > 0){

            for (var i = 0; i < issue.comments.length; i++) {

                var comment = {};

                comment.comment = (issue.comments[i].comment) ? issue.comments[i].comment : '';
                comment.created = (issue.comments[i].created) ? issue.comments[i].created : Date.now;
                comment.id = (issue.comments[i]._id) ? issue.comments[i]._id : '';

                if(issue.comments[i]._user !== undefined && issue.comments[i]._user !== null){

                    comment.user = {
                        id         : (issue.comments[i]._user._id) ? issue.comments[i]._user._id : issue.comments[i]._user,
                        username   : (issue.comments[i]._user.username) ? issue.comments[i]._user.username :  '',
                        mail       : (issue.comments[i]._user.mail) ? issue.comments[i]._user.mail :  ''
                    };


                }

                parseIssue.comments.push(comment);


            }
        }


    }


    return parseIssue;




};






module.exports = mongoose.model('Issue', issueSchema);
