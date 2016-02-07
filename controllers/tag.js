'use strict';
var Question  = require('../models/question');
var Tag  = require('../models/tag');
var mongoose = require('mongoose');

exports.newtag = function newtag (request, response){
	Tag.createTag(request.body).then(function(error,tags)
	{
		if(error)
		{
			response.json(error);
		}
		else
		{
			response.status("200").json(tags);
		}
	});
}

exports.gettags = function gettags (request, response){
	Tag.getTags().then(function(error,tags)
	{
		if(error)
		{
			response.json(error);
		}
		else
		{
			response.status("200").json(tags);
		}
	});
}

exports.getQuestionsByTag = function getQuestionsByTag(request, response){
	Tag.getTag(request.params.tagid).then(function(error,tag){
		if(error)
		{
			response.json(error);
		}
		else
		{
			response.status("200").json(tag.tagQuestions);
		}
	});
}
