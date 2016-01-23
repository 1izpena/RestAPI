'use strict';
var mongoose = require('mongoose');
var Hope      	= require('hope');
var Schema = mongoose.Schema;

var answerSchema = new Schema({
	body:{ type: String, required: true },
	_user : { type: Schema.ObjectId, ref: 'user', required: true },
	created:{ type: Date, required: true },
	modified:{ type: Date},
	votes: Number,
	comments:[{comment: String, _user:{ type: Schema.ObjectId, ref: 'user', required: true }}]
});

answerSchema.statics.createAnswer = function createAnswer (attributes) {
var promise = new Hope.Promise();
var Answer = mongoose.model('Answer', answerSchema);
Answer = new Answer(attributes);
Answer.save(function (error, answer){
	if(error)
	{
		var messageError = '';
		if(error.errors.body != undefined)
		{
			messageError = "Questions body required";
		}
		else if(error.errors.created != undefined)
		{
			messageError = "Questions created date required";
		}
		else if (error.errors._user != undefined)
		{
			messageError = "User required";
		}
		error = { code: 400, message: messageError };
		return promise.done(error,null);
	}
	else
	{
		
		return promise.done(error,answer);
	}

});
return promise;
}

module.exports = mongoose.model('Answer', answerSchema);