var Question  = require('../models/question');
var Answer  = require('../models/answer');
var Tag  = require('../models/tag');
var Hope      	= require('hope');
var async = require("async");

exports.createquestion = function createquestion (data) {

    var promise = new Hope.Promise();

    var tags = data.tags;
    data.tags =[];
    Question.createQuestion(data).then(function createQuestion (error, question){
        if(error)
        {
            return promise.done(error,null);
        }
        else
        {
            var tagQuestions= [];
            tagQuestions.push(question._id);
            async.each(tags,function(tagItem,callback){
                    var data ={"text": tagItem.text,"tagQuestions": tagQuestions};
                    // Buscamos el tag, si no existe se crea
                    Tag.searchTag(data).then(function(error,tag){
                        if (error)
                        {
                            console.log(error);
                            callback(error);
                        }
                        else
                        {
                            // Añadimos el tag creado a la pregunta
                            question.tags.push(tag);
                            callback();
                        }
                    })},
                function(error)
                {
                    if(error)
                    {
                        return promise.done(error,null);
                    }
                    else
                    {
                        question.save(function(error,question){
                            if(error)
                            {
                                return promise.done(error,null);
                            }
                            else
                            {
                                return promise.done(null,question);
                            }
                        });
                    }

                }
            );
        }
    });

    return promise;

}

exports.createanswers = function createAnswers (answers) {

    var promise = new Hope.Promise();

    var answersCreated = [];

    async.each(answers ,function(answer, callback) {
        Answer.createAnswer(answer).then(function createAnswer(error, answer) {
            if (error) {
                callback(error);
            }
            else {
                answersCreated.push(answer._id);
                callback()
            }
        });
    }
    ,function(error) {
        if(error)
        {
            return promise.done(error,null);
        }
        else
        {
            return promise.done(null,{answersCreated: answersCreated });
        }
    });

    return promise;

}
