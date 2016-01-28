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
	comments:[{comment: String, _user:{ type: Schema.ObjectId, ref: 'user', required: true }, created: Date}],
	userVotes:[{type: Schema.ObjectId, ref: 'User'}]
});

/*Crear respuesta*/
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


/* static methods*/
/* ACTUALIZAR respuesta*/
answerSchema.statics.updateAnswer = function updateAnswer(id, update, options) {
    var promise = new Hope.Promise();
    this.findByIdAndUpdate(id, update, options,function(error, comment) {
        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(error, comment);
        }
    });
    return promise;
};

answerSchema.statics.voteAnswer= function voteanswer (id , attributes)
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
		var Answer = mongoose.model('Answer', answerSchema);
		var query = { $and: [ {_id: id }, { userVotes: { $ne: attributes._user }}]};
		var update = { $inc: {votes: attributes.vote}, $push: {userVotes:  attributes._user}};
		var options = { new: true};
		Answer.findOne({_id: id},function(error,result) {
			if(error)
			{
				
				return promise.done(error,null);
			}
			else
			{
				if(result == null)
				{
					error = {code: 402, message:"Answer not found"}

					return promise.done(error,null);
				}
				else
				{
					Answer.findOneAndUpdate(query, update, options,function(error,result) {
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

answerSchema.statics.deleteAnswer = function deleteanswer(id)
{
	var promise = new Hope.Promise();
    this.remove({_id:id},function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(null, {message: 'Answer deleted successfully'});
        }
    });
    return promise;
}

module.exports = mongoose.model('Answer', answerSchema);