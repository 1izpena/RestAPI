'use strict';
var mongoose = require('mongoose');
var Hope      	= require('hope');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
	title:{ type: String, required: true },
	body:{ type: String, required: true },
	_user : { type: Schema.ObjectId, ref: 'user', required: true},
	created:{ type: Date, required: true },
	modified:{ type: Date },
	answercount: Number,
	votes: Number,
	views: Number,
	comments:[{comment: String, _user:{ type: Schema.ObjectId, ref: 'user'}, created: Date}],
	tags:[{ tag: String }],
	answers:[{type: Schema.ObjectId, ref: 'Answer'}],
	userVotes:[{type: Schema.ObjectId, ref: 'user'}]
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
			messageError = "Questions title required";
		}
		else if(error.errors.body != undefined)
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
		var result = { code: 200, message: "Question successfully created" }
		return promise.done(error,result);
	}

});
return promise;
}

/* static methods*/
/* ACTUALIZAR pregunta*/
questionSchema.statics.updateQuestion = function updatequestion (id, update, options) {
    var promise = new Hope.Promise();
    this.findByIdAndUpdate(id, update, options,function(error, question) {
        if (error) {
        	console.log(error);
            return promise.done(error, null);
        }else {
            return promise.done(error, question);
        }
    });
    return promise;
};

/* static methods*/
/* método para votar*/
questionSchema.statics.voteQuestion = function votequestion (id , attributes)
{
	var promise = new Hope.Promise();
	var Question = mongoose.model('Question', questionSchema);
	var query = { $and: [ {_id: id }, { userVotes: { $ne: attributes._user }}]};
	var update = { $inc: {votes: attributes.vote}, $push: {userVotes:  attributes._user}};
	var options = { new: true};
	Question.findOneAndUpdate(query, update, options,function(error,result) {
		if(error)
		{
			var messageError = '';
			console.log(error.errors);
			return promise.done(error,null);
			
		}
		else 
		{
			console.log(result);
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