'use strict';
var Question  = require('../models/question');
var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var mongoose = require('mongoose');


exports.newquestion = function newquestion (request, response){
	Auth(request, response).then(function(error, result) {
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{	
			var user = {"_id" : result.id};
			request.body._user = user;
			Question.createQuestion(request.body).then(function createQuestion (error, result){
				if(error)
				{
					response.status(error.code).json({message: error.message});
				}
				else
				{
					response.json(result.message);
				}
			});
		}
	});
}



exports.getquestions = function getquestions(request, response)
{
	Question.getQuestions().then(function getQuestions(error, result){

		if (error)
		{
			console.log("ERROR");
			response.status(error.code).json({message: error.message});
		}
		else
		{
			response.json(result);
		}
	});
}

exports.getquestionbyid = function getquestionbyid(request, response)
{
	Question.getQuestion(request.params.questionid).then(function getQuestion(error,result){
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{
			response.status("200").json(result);
		}
	});
	
}

exports.upvote = function upvote (request , response){
	Auth(request, response).then(function(error, result) {
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{
			var user = {"_id" : result.id};
			request.body._user = user;
			Question.voteQuestion(request.params.questionid, request.body).then(function voteQuestion(error,result){
				if(error)
				{
					response.status(error.code).json({message: error.message});
				}
				else
				{
					response.json(result);
				}
			});
		}
	});
}

exports.downvote = function downvote (request , response){
	var update = { $inc : request.body.vote};
	Auth(request, response).then(function(error, result) {
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{
			var user = {"_id" : result.id};
			request.body._user = user;
			Question.voteQuestion(request.params.questionid, request.body).then(function voteQuestion(error,result){
				if(error)
				{
					response.status(error.code).json({message: error.message});
				}
				else
				{
					response.json(result.message);
				}
			});
		}
	});
}

exports.commentquestion = function commentquestion(request, response)
{
	Auth(request, response).then(function(error, result){
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{
			var query = {_id: request.params.questionid};
			var update = { $push: { comments: { "comment":request.body.comment, "created":request.body.created, _user:{"_id": result.id}}}};
			var options = {};
			Question.updateQuestion(query,update, options).then(function(error,result){
				if(error)
				{
					response.status(error.code).json({message: error.message});
				}
				else
				{
					response.status("200").json("Comment created");
				}
			});
		}
	});
}

