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
