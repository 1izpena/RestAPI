'use strict';
var mongoose = require('mongoose');
var Hope      	= require('hope');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
	text:{ type: String, required: true },
	description: String,
	tagQuestions:[{type: Schema.ObjectId, ref: 'Question'}]
});


/* Static methods*/
/*Crear un tag*/
tagSchema.statics.createTag = function createTag (attributes) {
var promise = new Hope.Promise();
var Tag = mongoose.model('Tag', tagSchema);
Tag = new Tag(attributes);
Tag.save(function (error, tag){
	if(error)
	{

		var messageError = '';
		if (error.errors.text != undefined)
		{
			messageError = "Tag name required";
		}
		error = { code: 400, message: messageError };
		return promise.done(error,null);
	}
	else
	{
		return promise.done(error,tag);
	}

});
return promise;
}

/*Static methods */
/*Obtener todos los tags*/
tagSchema.statics.getTags = function getTags () {
	var promise = new Hope.Promise();
	var Tag = mongoose.model('Tag', tagSchema);
	Tag.find(function(error,result){
		if(error)
		{
			var messageError = '';
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
/* ACTUALIZAR pregunta*/
tagSchema.statics.updateTag = function updateTag (id, update, options) {
    var promise = new Hope.Promise();
    this.findByIdAndUpdate(id, update, options,function(error, question) {
        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(error, question);
        }
    });
    return promise;
};

tagSchema.statics.getTag = function getTag(id){
	var promise = new Hope.Promise();
	var Tag = mongoose.model('Tag', tagSchema);
	Tag.findById(id,function(error,result){
		if(error)
		{
			var messageError = '';
			return promise.done(error,null);
		}
		else
		{
			return promise.done(error,result);
		}
	});
	return promise;

}


module.exports = mongoose.model('Tag', tagSchema);