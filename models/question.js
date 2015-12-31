'use strict';
var mongoose = require('mongoose');
var Hope      	= require('hope');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
	title:{ type: String, required: true },
	body:{ type: String, required: true },
	_user : { type: Schema.ObjectId, ref: 'user'},
	created:{ type: Date, required: true },
	modified:{ type: Date },
	answercount: Number,
	votes: Number,
	views: Number,
	comments:[{comment: String, _user:{ type: Schema.ObjectId, ref: 'user'}}],
	tags:[{ tag: String }],
	answers:[{type: Schema.ObjectId, ref: 'Answer'}]
});

/* static methods */
/* Nueva pregunta en el foro*/

questionSchema.statics.createQuestion = function createQuestion (attributes) {
var promise = new Hope.Promise();
var Question = mongoose.model('Question', questionSchema);
Question = new Question(attributes);
Question.save(function (error){
	if(error)
	{
		var messageError = '';
		if(error.errors.title != undefined)
		{
			messageError ="Questions title required";
		}
		else if(error.errors.body != undefined)
		{
			messageError="Questions body required";
		}
		else if(error.errors.created != undefined)
		{
			messageError="Questions created date required";
		}
		error = { code: 400, message: messageError };
		return promise.done(error,null);
	}
	else
	{
		
		var result = { code: 200, message: "Question successfully created" }
		return promise.done(error,result);
	}

});
return promise;
}

/* static methods */
/* obtener preguntas mas votadas*/
questionSchema.statics.mostVoted = function mostVoted(){
	var promise = new Hope.Promise();
	var Question = mongoose.model('Question', questionSchema);
	Question.find(function(error,result){
		if(error)
		{
			var messageError = '';
			return promise.done(error,null);
		}
		else
		{
			return promise.done(error,result);
		}
	}).sort({votes: -1});
	return promise;
}

/* static methods */
/* obtener preguntas mas visitadas*/
questionSchema.statics.mostVisited = function mostVoted(){
	var promise = new Hope.Promise();
	var Question = mongoose.model('Question', questionSchema);
	Question.find(function(error,result){
		if(error)
		{
			var messageError = '';
			return promise.done(error,null);
		}
		else
		{
			return promise.done(error,result);
		}
	}).sort({views: -1});
	return promise;
}

/* static methods */
/* Obtener últimas preguntas*/
questionSchema.statics.lastQuestions = function mostVoted(){
	var promise = new Hope.Promise();
	var Question = mongoose.model('Question', questionSchema);
	Question.find(function(error,result){
		if(error)
		{
			var messageError = '';
			return promise.done(error,null);
		}
		else
		{
			return promise.done(error,result);
		}
	}).sort({created: -1});
	return promise;
}
questionSchema.methods.parse = function parse () {
    var question = this;
    return {
        id:        question._id,
        title:     question.title,
        body:      qustion.body,   
    };
};
module.exports = mongoose.model('Question', questionSchema);