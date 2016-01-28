'use strict';
var Question  = require('../models/question');
var Tag  = require('../models/tag');
var mongoose = require('mongoose');

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

console.log("get");
}

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