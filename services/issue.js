/**
 * Created by izaskun on 29/05/16.
 */


var mongoose = require('mongoose');
var Hope  = require('hope');
var Issue  = require('../models/issue');


exports.getissues = function getissues (channelid){
    var promise = new Hope.Promise();
    var Issue = mongoose.model('Issue');

    var query = { channel: channelid};

    Issue.searchIssues (query).then (function (error, issues) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, issues);
        }
    });
    return promise;
};





exports.newissue = function newissue(issue){
    var promise = new Hope.Promise();
    var Issue = mongoose.model('Issue');

    Issue.createIssue (issue).then (function (error, newissueresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            var query = { _id: newissueresult._id};
            Issue.searchIssues (query, 1).then (function (error, issueresult) {
                if (error) {
                    return promise.done(error, null);
                }
                else {
                    return promise.done(null, issueresult);
                }
            });


        }
    });
    return promise;
};



exports.getissueByIdwithquery = function getissueByIdwithquery (query){
    var promise = new Hope.Promise();
    var Issue = mongoose.model('Issue');


    Issue.searchIssues (query,1).then (function (error, issues) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, issues);
        }
    });

    return promise;
};







exports.updateissueRemoveUs = function updateissue(userstoryid) {
    var promise = new Hope.Promise();
    var Issue = mongoose.model('Issue');

    var update = {};
    update = {$pull: {userstories: userstoryid}};
    var options = {multi: true};
    var query = { userstories : userstoryid};


    Issue.updateIssuesByQuery (query, update, options).then (function (error, raw) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            console.log("esto me devuelve raw");
            console.log(raw);
            return promise.done(null, raw);

        }
    });
    return promise;

};






exports.updateissue = function updateissue(issueid, num, fieldnewvalue){
    var promise = new Hope.Promise();
    var Issue = mongoose.model('Issue');

    var update = {};
    var options = {new: true};

    /* de momento 1 assigned y 2 unassigned */


    if(num == 1){
        update.assignedto = fieldnewvalue;

    }
    else if(num == 2){
        /* unassigned  /* db.users.update({},{$unset: {githubtoken:1}},false,true)*/
        update = {$unset: {assignedto:1}};
    }
    else if(num == 4){
        update = {$push: {comments: fieldnewvalue}};


    }
    else if(num == 5){
        update = {$pull: {comments: {_id: fieldnewvalue}}};

    }
    else if(num == 6){
        update.subject = fieldnewvalue;

    }
    else if(num == 7){
        update.description = fieldnewvalue;

    }
    else if(num == 8){
        update.type = fieldnewvalue;

    }
    else if(num == 9){

        update.severity = fieldnewvalue;
    }
    else if(num == 10){
        update.priority = fieldnewvalue;

    }
    else if(num == 11){
        update.status = fieldnewvalue;

    }
    else if(num == 12){
        update.voters = fieldnewvalue;
    }
    else if(num == 13){
        update = {$push: {userstories: fieldnewvalue}};
    }


    Issue.updateIssueyById (issueid, update, options).then (function (error, newissueresult) {
        if (error) {
            return promise.done(error, null);
        }
        else {

            var query = { _id: newissueresult._id};
            Issue.searchIssues (query, 1).then (function (error, issueresult) {
                if (error) {
                    return promise.done(error, null);
                }
                else {

                    return promise.done(null, issueresult);
                }
            });

        }
    });
    return promise;
};






exports.deleteissueById = function deleteissueById (issueid){
    var promise = new Hope.Promise();
    var Issue = mongoose.model('Issue');

    var query = { _id: issueid};



    Issue.deleteIssueById (issueid).then (function(error) {
        if (error) {
            return promise.done(error, null);

        }
        else {
            console.log("Issue deleted successfully2");
            return promise.done(null, issueid)
        }
    });



    return promise;
};





exports.deleteIssues = function deleteIssues (channelid){
    var promise = new Hope.Promise();
    var Issue = mongoose.model('Issue');


    var query = {channel : channelid};


    Issue.deleteIssues (query).then (function(error, removed) {
        if (error) {
            return promise.done(error, null);

        }
        else {

            return promise.done(null, removed);
        }
    });



    return promise;
};