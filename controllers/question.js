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
			/*
			Question.voteQuestion(request.params.questionid, request.body).then(function voteQuestion(error,result){
				if(error)
				{
					response.status(error.code).json({message: error.message});
				}
				else
				{
					response.json(result.message);
				}
			});*/
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

exports.mostvoted = function mostvoted(request, response)
{
	Question.mostVoted().then(function mostVoted(error, result){

		if (error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{
			response.json(result);
		}
	});
}

exports.lastquestions = function lastquestions(request, response)
{
	Question.lastQuestions().then(function lastQuestions(error, result){

		if (error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{
			response.json(result);
		}
	});
}

exports.mostvisited = function mostvisited(request, response)
{
	Question.mostVisited().then(function mostVisited(error, result){

		if (error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{
			response.json(result);
		}
	});
}
