'use strict';
var Question  = require('../models/question');
var Answer  = require('../models/answer');
var QuestionService  = require('../services/question');
var Tag  = require('../models/tag');
var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var mongoose = require('mongoose');
var async = require("async");



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

			QuestionService.createquestion(request.body).then(function createquestion (error, result){
				if(error)
				{
					response.status(error.code).json({message: error.message});
				}
				else
				{
					return response.status("200").json(result);

				}
			});
		}
	});
}

exports.deletequestion = function deletequestion(request, response){
	Auth(request, response).then(function(error, result) {
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{	
			Question.deleteQuestion(request.params.questionid).then(function(error,result)
			{
				if(error)
				{
					response.json({message:error.message});
				}
				else
				{
					response.json(result);
				}
			});			
		}
	});
}

exports.editquestion = function editquestion(request, response)
{
	Auth(request, response).then(function(error, result) {
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{	
			Question.deleteQuestion(request.params.questionid)
		}
	});
}


exports.getquestions = function getquestions(request, response)
{
	Question.getQuestions().then(function getQuestions(error, result){

		if (error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{
			response.status("200").json(result);
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
					response.status(result.code).json(result.message);
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
					response.status(result.code).json(result.message);
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
			var options = {new : true};
			Question.updateQuestion(query,update, options).then(function(error,result){
				if(error)
				{
					response.status(error.code).json({message: error.messageError});
				}
				else
				{
					response.status("200").json(result.comments);
				}
			});
		}
	});
}



