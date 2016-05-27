'use strict';
var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var User  = require('./user');
var Answer = require('./answer');
var Tag = require('./tag');
var Hope      	= require('hope');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
	title:{ type: String, required: true,  es_indexed:true },
	body:{ type: String, required: true,  es_indexed:true },
	_user : { type: Schema.ObjectId, ref: 'User'},
	created:{ type: Date, required: true },
	modified:{ type: Date },
	answercount: Number,
	votes: Number,
	views: Number,
	comments:[{comment: String, _user:{ type: Schema.ObjectId, ref: 'User'}, created: Date}],
	tags:[{type: Schema.ObjectId, ref: 'Tag'}],
	answers:[{type: Schema.ObjectId, ref: 'Answer', es_indexed:true }],
	userVotes:[{type: Schema.ObjectId, ref: 'User'}]
});

questionSchema.plugin(mongoosastic);


/* static methods */
/* Nueva pregunta en el foro*/

questionSchema.statics.createQuestion = function createQuestion (attributes) {
var promise = new Hope.Promise();
var Question = mongoose.model('Question', questionSchema);
if(attributes.votes == undefined && attributes.views == undefined)
{
	attributes.votes = 0;
	attributes.views = 0;
}
Question = new Question(attributes);
Question.save(function (error, question){
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

		return promise.done(error,question);
	}

});
return promise;
}

/* static methods*/
/* ACTUALIZAR pregunta*/
questionSchema.statics.updateQuestion = function updatequestion (id, update, options) {
    var promise = new Hope.Promise();
     this.findByIdAndUpdate(id, update, options).populate('comments._user').exec(function(error, question) {
        if (error) {
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
	var messageError = '';
	if(id === null)
	{
		messageError = "question ID is required";
		error = { code: 400, message: messageError };
        return promise.done(error, null);
	}
	else if(attributes._user === null)
	{
		messageError = "User is required";
		error = { code: 400, message: messageError };
        return promise.done(error, null);
	}
	else if(attributes.vote === null)
	{
		messageError = "Vote is required";
		error = { code: 400, message: messageError };
        return promise.done(error, null);
	}
	else
	{
		var promise = new Hope.Promise();
		var Question = mongoose.model('Question', questionSchema);
		var query = { $and: [ {_id: id }, { userVotes: { $ne: attributes._user }}]};
		var update = { $inc: {votes: attributes.vote}, $push: {userVotes:  attributes._user}};
		var options = { new: true};
		Question.findOne({_id: id},function(error,result) {
			if(error)
			{
				return promise.done(error,null);
			}
			else
			{
				if(result == null)
				{
					error = {code: 402, message:"Question not found"}

					return promise.done(error,null);
				}
				else
				{
					Question.findOneAndUpdate(query, update, options,function(error,result) {
						if(error)
						{
							return promise.done(error,null);
						}
						else
						{
							if(result == null)
							{
								error = {code : 402, message:"You have already voted"}
								return promise.done(error,null);
							}
							else
							{
								result = {code:"200", message:"Vote successfully"}
								return promise.done(error,result);
							}
						}
					});
				}
			}
		});
	}
	return promise;
}

/* static methods */
/* Obtener Todas las preguntas disponibles*/
questionSchema.statics.getQuestions = function getQuestions(){
	var promise = new Hope.Promise();
	var Question = mongoose.model('Question', questionSchema);
	Question.find().populate('_user tags').exec(function(error,result){
		if(error)
		{
			var messageError = '';
			error = {code:"400", message:'Questions not found'};
			return promise.done(error,null);
		}
		else
		{

			return promise.done(error,result);
		}
	});
	return promise;
}

/* static methods*/
/* obtener la pregunta por identificador*/
questionSchema.statics.getQuestion = function getQuestion(attributes)
{
	var promise = new Hope.Promise();
	var Question = mongoose.model('Question', questionSchema);
	Question.incrementView(attributes,function(error){
		if(error)
		{
			return promise(error,null);
		}
	});
	Question.findOne({_id: attributes}).lean().populate('_user comments._user answers tags').exec(function(error,question){
		if(error)
		{
			error = {code:'400', message:'Undefined id'};
			return promise.done(error,null);
		}
		else	
		{   if(question === null)
			{
				error = {
                    code: 400,
                    message: "Question not Exist."
                };
                 return promise.done(error,null);
			}
			else if (question.length === 0) {
                error = {
                    code: 402,
                    message: "Question not found."
                };
                return promise.done(error,null);
            }
            else
            {
            	User.populate(question, {
     				path: 'answers._user answers.comments._user',
      				select: 'username'
    				},
    				function (error, updatedQuestion) 
    				{
    					return promise.done(error,updatedQuestion);
   					}
   				);
  			} 							
        }	
	});
	return promise;
}

questionSchema.statics.deleteQuestion = function deleteQuestion(id)
{
	var promise = new Hope.Promise();
	var Question = mongoose.model('Question', questionSchema);
	Question.findById(id, function(error,question)
	{
		if(error)
		{
			return promise.done(error, null);
		}
		else
		{
			if( question.answers.length != 0)
			{
				question.answers.forEach(function(answer)
				{
					Answer.deleteAnswer(answer,function(error)
					{
						if(error)
						{
							return promise.done(error,null);
						}
					});
				});	
			}
			Tag.deleteQuestionInTag(id,question.tags,function(error)
			{
				if (error)
				{
					return promise.done(error, null);
				}
			});
			Question.remove({_id:id},function(error) {
				if (error) {
				        return promise.done(error, null);
				    }else {
				        return promise.done(null, {message: 'Question deleted successfully'});
				    }
				});	
		}
	});
    return promise;
}

questionSchema.statics.incrementView = function incrementView(id)
{
	var promise = new Hope.Promise();
	var query = { _id: id };
	var update = { $inc: {views: 1}};
	var options = { new: true};
	var Question = mongoose.model('Question', questionSchema);
	Question.updateQuestion(query,update,options, function(error,result){
		if(error)
		{
			return promise.done(error,null)
		}
		else
		{
			return promise.done(error,result);
		}
	});
	return promise;
}


/*Parser de una Pregunta*/
questionSchema.methods.parse = function parse () {
    var question = this;
    var commentsArray = [];
    var newcomment = {};
    question.comments.forEach(function(comment) 
    {
    	newcomment ={

				comment: comment.comment,
				_user: {
	            _id         : (comment._user._id) ? comment._user._id : comment._user,
	            username   : (comment._user.username) ? comment._user.username :  ''
	        	},
	        	created: comment.created
			};
			commentsArray.push(newcomment);
    });


     	
    return {
        _id:        question._id,
        title:     question.title,
        body:      question.body, 
        _user: {
            _id         : (question._user._id) ? question._user._id : question._user,
            username   : (question._user.username) ? question._user.username :  ''
        },
        created:   question.created,
        modified:  question.modified,
        answercount: question.answercount,
		votes: question.votes,
		views: question.views,
		comments: commentsArray,		
		tags: question.tags,	
		answers: question.answers
	}
}



//Crear mapeado y copiar coleccion elastic,solo ejecutar la primera vez

var Question = mongoose.model('Question', questionSchema);
Question.createMapping(function(err, mapping){
   if(err){
   //  console.log('error creating mapping (you can safely ignore this)');
   //  console.log(err);
   }else{
    // console.log('mapping created!');
    // console.log(mapping);
   }
 });



var Question = mongoose.model('Question', questionSchema)
  , stream = Question.synchronize()
  , count = 0;

stream.on('data', function(err, doc){
  count++;
});
stream.on('close', function(){
  console.log('indexed questions ' + count + ' documents!');
});
stream.on('error', function(err){
  console.log(err);
});





module.exports = mongoose.model('Question', questionSchema);
