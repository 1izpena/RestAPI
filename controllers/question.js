'use strict';
var Question  = require('../models/question');
var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var mongoose = require('mongoose');


exports.newquestion = function newquestion (request, response){
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
