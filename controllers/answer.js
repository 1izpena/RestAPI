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
					var update = { $push: { answers: answer._id},$inc: {answercount: 1}};
					var options = {};
					Question.updateQuestion(request.body.questionid,update,options).then(function updateQuestion (error,result)
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
			})
		}
	});
}
