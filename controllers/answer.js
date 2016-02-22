'use strict';
var Question  = require('../models/question');
var Answer = require('../models/answer');
var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var mongoose = require('mongoose');


exports.newanswer = function newanswer(request,response){
	Auth(request, response).then(function(error, result) {
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{	
			var user = {"_id" : result.id};
			request.body._user = user;
			Answer.createAnswer(request.body).then(function createAnswer (error, answer){
				if(error)
				{
					response.status(error.code).json({message: error.message});
				}
				else
				{
					var query = {_id: request.params.questionid};
					var update = { $inc: {answercount: 1}, $push: { answers: answer._id}};
					var options = {};
					Question.updateQuestion(query,update,options).then(function updateQuestion (error,result)
					{
						if(error)
						{
							response.status(error.code).json({message: error.message});
						}
						else
						{
							response.json(answer);
						}
					});			
				}
			});
		}
	});
}
/*Elimina la respuesta y modifica el array de preguntas para quitar la respuesta*/
exports.deleteanswer = function deleteanswer(request, response){
	Auth(request, response).then(function(error, result) {
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{	
			var query = {_id: request.params.questionid};
			var update = { $inc: {answercount: -1}, $pull: { answers: request.params.answerid}};
			var options = {new: true};
			Question.updateQuestion(query,update,options).then(function updateQuestion (error,question)
			{
				if(error)
				{
					response.json({message:error.message});
							
				}
				else
				{
					Answer.deleteAnswer(request.params.answerid).then(function deleteAnswer(error,result)
					{
						if(error)
						{
							response.json({message: error.message});
						}
						else
						{
							response.json(question);
						}	
					});	
				}				
			});
		}
	});
}


exports.editanswer = function editanswer(request, response)
{
	Auth(request, response).then(function(error, result) {
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{	
			var query = {_id: request.params.answerid};
			var update = {"body":request.body.body, "modified": request.body.modified};
			var options = {new: true};
			Answer.updateAnswer(query,update,options).then( function updateAnswer (error,answer){
				if(error)
				{
					response.json({message:error.message});
				}
				else
				{
					response.status("200").json(answer);
				}
			});
		}
	});
}



exports.commentanswer = function commentanswer(request, response){
	Auth(request, response).then(function(error, result) {
		if(error)
		{
			response.status(error.code).json({message: error.message});
		}
		else
		{	
			var query = {_id: request.params.answerid};
			var update = { $push: { comments: { "comment":request.body.comment, "created":request.body.created, _user:{"_id": result.id}}}};
			var options = {new: true};
			Answer.updateAnswer(query,update, options).then(function updateAnswer (error,answer)
			{
				if(error)
				{
					response.status(error.code).json({message: error.message});
				}
				else
				{
					
					response.status("200").json(answer.comments);
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
			Answer.voteAnswer(request.params.answerid, request.body).then(function voteAnswer(error,result){
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
			Answer.voteAnswer(request.params.answerid, request.body).then(function voteAnswer(error,result){
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
	});
}

