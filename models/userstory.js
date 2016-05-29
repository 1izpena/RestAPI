/**
 * Created by izaskun on 24/05/16.
 */


'use strict';


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AutoIncrement = require('mongoose-sequence');

var User  = require('./user');
var Task  = require('./task');
var Sprint  = require('./sprint');
var Channel = require('./channel');


var Hope      	= require('hope');




var userstorySchema = new Schema({

    num         : Number,
    subject     : { type: String, required: true },
    createdby   : { type: Schema.ObjectId, ref: 'User', required: true },
    datetime    : { type: Date, default: Date.now },
    sprint      : { type: Schema.ObjectId, ref: 'Sprint', required: false },
    voters      : [{ type: Schema.ObjectId, ref: 'User', required: false }],
    point      : {
        ux      : {type: Number, required: false},
        design  : {type: Number, required: false},
        front   : {type: Number, required: false},
        back    : {type: Number, required: false},
    },
    attachments : [{ type: String, required: false }],
    tasks       : [{ type: Schema.ObjectId, ref: 'Task', required: false }],
    tags        : [{ type: String, required: false }],

    /* status se resuelve con las tareas en angular */
    description : { type: String, required: false },
    requirement : {
        team      : {type: Boolean, default: false },
        client    : {type: Boolean, required: false},
        blocked   : {type: Boolean, required: false}
    },

    /* con el id de sobra */
    channel     : { type: Schema.ObjectId, ref: 'Channel', required: true }




});

userstorySchema.plugin(AutoIncrement, {inc_field: 'num'});


/* metodos create, get y delete */
userstorySchema.statics.createUserstory = function createUserstory (attributes) {

    var promise = new Hope.Promise();
    var Userstory = mongoose.model('Userstory', userstorySchema);

    Userstory = new Userstory(attributes);
    Userstory.save(function (error, userstory) {
        if(error){


            console.log("hay error al guardar userstory");
            console.log(error);
            return promise.done(error, null);
        }else {
            return promise.done(null, userstory);
        }
    });
    return promise;
};



/* para buscar si existe 1 concreta */
userstorySchema.statics.searchUserstories = function searchUserstories (query, limit, page) {
    var promise = new Hope.Promise();


    /* skip is number of results that not show */
    if(typeof page === "undefined" || page == null) {
        page = 0;
    }
    if(typeof limit === "undefined" || limit == null) {
        limit = 0;
    }
    var skip = (page * limit);


    this.find(query)
        .skip(skip)
        .limit(limit)
        .exec(function(error, value) {

            if(error){
                return promise.done(error, null);
            }
            else if (limit === 1){
                if (value.length === 0) {
                    error = {
                        code: 402,
                        message: "Userstory not found."
                    };

                }
                value = value[0];
            }
            else{
                value = value.map(function(elem,index) {

                    return elem;
                });


            }/* end else:: want multiple values & parse this values */

            return promise.done(error, value);

        });

    return promise;
};





/* en el search hay que hacer populate
* getUserstories */
userstorySchema.statics.searchPopulatedUserstories = function searchPopulatedUserstories (query, limit, page) {
    var promise = new Hope.Promise();


    /* skip is number of results that not show */
    if(typeof page === "undefined" || page == null) {
        page = 0;
    }
    if(typeof limit === "undefined" || limit == null) {
        limit = 0;
    }
    var skip = (page * limit);


    this.find(query).sort({num: -1})
        .skip(skip)
        .limit(limit)
        /* quitamos sprint de aqui y sprint.createdby, y solo mandamos los ids */
        .populate('createdby tasks')
        .exec(function(error, value) {

            if(error){
                return promise.done(error, null);
            }
            else if (limit === 1){
                if (value.length === 0) {
                    error = {
                        code: 402,
                        message: "Userstory not found."
                    };
                    value = [];
                }
                else {
                    value = value[0].parse();
                }
            }
            else{
                value = value.map(function(elem,index) {

                    return elem.parse();
                });
                // Ordenamos x orden descendente
                value = value.reverse();

            }/* end else:: want multiple values & parse this values */

            // Devolvemos en order ascendente de fecha
            return promise.done(error, value);

        });

    return promise;
};





userstorySchema.statics.deleteUserstoryById = function deleteUserstoryById (id) {
    var promise = new Hope.Promise();
    this.remove({_id:id},function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("userstory deleted successfully");
            return promise.done(null, {message: 'Userstory deleted successfully'});
        }
    });
    return promise;
};



userstorySchema.statics.deleteUserstories = function deleteUserstories (query) {
    var promise = new Hope.Promise();
    this.remove(query,function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("Userstories deleted successfully");
            return promise.done(null, {message: 'Userstories deleted successfully'});
        }
    });
    return promise;
};



/* parse hay que mirar que nos interesa, quizas hacer populated */

userstorySchema.methods.parse = function parse () {
    var userstory = this;


    var parseUserstory = {
        id          : userstory._id,
        num         : userstory.num,
        subject     : userstory.subject,
        createdby   : {
            id         : (userstory.createdby._id) ? userstory.createdby._id : userstory.createdby,
            username   : (userstory.createdby.username) ? userstory.createdby.username :  '',
            mail       : (userstory.createdby.mail) ? userstory.createdby.mail :  ''
        },
        datetime    : userstory.datetime,
        sprint      : userstory.sprint,
        /* quizas quitar o meter all,segun necesite */
        tags        : userstory.tags,
        /* esto me vale asi,xq solo quiero ver si el id coincide con el mio, entonces no voto
        * y contar el num de elementos para saber los votos totales */
        voters      : userstory.voters,
        point       : userstory.point,
        description : userstory.description,
        requirement: userstory.requirement,
        attachments : userstory.attachments,
        channel     : userstory.channel


    };

    parseUserstory.totalPoints = 0;

    if(userstory.point !== null && userstory.point !== undefined){

        if(userstory.point.ux !== null && userstory.point.ux !== undefined){
            parseUserstory.totalPoints += userstory.point.ux;
        }
        if(userstory.point.design !== null && userstory.point.design !== undefined){
            parseUserstory.totalPoints += userstory.point.design;
        }
        if(userstory.point.back !== null && userstory.point.back !== undefined){
            parseUserstory.totalPoints += userstory.point.back;
        }
        if(userstory.point.front !== null && userstory.point.front !== undefined){
            parseUserstory.totalPoints += userstory.point.front;
        }


    }



/*
    if(userstory.sprint !== null && userstory.sprint !== undefined){



        parseUserstory.sprint = {
            id         : (userstory.sprint._id) ? userstory.sprint._id : userstory.sprint,
            title      : (userstory.sprint.title) ? userstory.createdby.title :  '',
            startdate  : (userstory.sprint.startdate) ? userstory.createdby.startdate :  Date.now,
            endingdate  : (userstory.sprint.endingdate) ? userstory.createdby.endingdate :  Date.now
        };

        if(userstory.sprint.createdby !== null && userstory.sprint.createdby !== undefined){
            parseUserstory.sprint.createdby   = {
                    id         : (userstory.sprint.createdby._id) ? userstory.sprint.createdby._id : userstory.sprint.createdby,
                    username   : (userstory.sprint.createdby.username) ? userstory.sprint.createdby.username :  '',
                    mail       : (userstory.sprint.createdby.mail) ? userstory.sprint.createdby.mail :  ''
            };

        }
    }
    */




    if(userstory.tasks !== null && userstory.tasks !== undefined){

        var arrayTaskStatus = [];
        if(userstory.tasks.length){


            var task;
            for (var i = 0; i < userstory.tasks.length; i++) {

                /* de task quiero all */
                task.id = (userstory.tasks[i]._id) ? userstory.tasks[i]._id : userstory.tasks[i];
                task.subject = (userstory.tasks[i].subject) ? userstory.tasks[i].subject : userstory.tasks[i];

                if(userstory.tasks[i].createdby !== undefined &&
                    userstory.tasks[i].createdby !== null &&
                    userstory.tasks[i].createdby !== '' ){

                    task.createdby = {
                        id         : (userstory.tasks[i].createdby._id) ? userstory.createdby.tasks[i]._id : userstory.createdby.tasks[i],
                        username   : (userstory.tasks[i].createdby.username) ? userstory.tasks[i].createdby.username :  '',
                        mail       : (userstory.tasks[i].createdby.mail) ? userstory.tasks[i].createdby.mail :  ''
                    };

                }

                task.datetime = (userstory.tasks[i].datetime) ? userstory.tasks[i].datetime : Date.now;
                if(userstory.tasks[i].assignedto !== undefined &&
                    userstory.tasks[i].assignedto !== null &&
                    userstory.tasks[i].assignedto !== '' ){

                    task.assignedto = {
                        id         : (userstory.tasks[i].assignedto._id) ? userstory.tasks[i].assignedto._id : userstory.tasks[i].assignedto,
                        username   : (userstory.tasks[i].assignedto.username) ? userstory.tasks[i].assignedto.username :  '',
                        mail       : (userstory.tasks[i].assignedto.mail) ? userstory.tasks[i].assignedto.mail :  ''
                    };

                }

                /* hacemos array para luego quitar las coincidencias */
                task.status = userstory.tasks[i].status;
                arrayTaskStatus.push(task.status);


                task.description = userstory.task[i].description;
                task.requirement = userstory.task[i].requirement;
                task.attachments = userstory.task[i].attachments;



                task.contributors = [];
                if(userstory.tasks[i].contributors !== undefined &&
                    userstory.tasks[i].contributors !== null &&
                    userstory.tasks[i].contributors !== '' ){
                    if(userstory.tasks[i].contributors.length){
                        var contributor = {};
                        for(var j = 0; j < userstory.task[i].contributors.length; j++){
                            contributor = {
                                id         : (userstory.tasks[i].contributors[j]._id) ? userstory.tasks[i].contributors[j]._id : userstory.tasks[i].contributors[j],
                                username   : (userstory.tasks[i].contributors[j].username) ? userstory.tasks[i].contributors[j].username :  '',
                                mail       : (userstory.tasks[i].contributors[j].mail) ? userstory.tasks[i].contributors[j].mail :  ''
                            };

                            task.contributors.push(contributor);


                        }

                    }

                }

                task.comments = [];
                if(userstory.tasks[i].comments !== undefined &&
                    userstory.tasks[i].comments !== null &&
                    userstory.tasks[i].comments !== '' ){
                    if(userstory.tasks[i].comments.length){
                        var comment = {};
                        for(var k = 0; k < userstory.task[i].comments.length; k++){
                            comment = {
                                id         : (userstory.tasks[i].comments[k]._id) ? userstory.tasks[i].comments[k]._id : userstory.tasks[i].comments[k],
                                username   : (userstory.tasks[i].comments[k].username) ? userstory.tasks[i].comments[k].username :  '',
                                mail       : (userstory.tasks[i].comments[k].mail) ? userstory.tasks[k].comments[k].mail :  ''
                            };

                            task.comments.push(comment);


                        }


                    }

                }




                /* hay que parsear y meterlo */
                parseUserstory.tasks.push(task);

            } /* end for */

            /* ahora reducimos el array y lo metemos */
            /* si el length es 1, ese es el status de userstory
             * sino si tiene alguna inprogress o new :: inprogress,
             * sino y tiene readyfor pues readyfor */

            if(arrayTaskStatus.length > 0){
                var arrayTaskStatusUniq = arrayTaskStatus.reduce(function(a,b){
                    if (a.indexOf(b) < 0 ) a.push(b);
                    return a;
                },[]);

                if(arrayTaskStatusUniq.length > 1){
                    if(arrayTaskStatusUniq.indexOf("New") || arrayTaskStatusUniq.indexOf("In progress")){
                        parseUserstory.status = "In progress";
                    }
                    else{
                        parseUserstory.status = "Ready for test";
                    }
                }
                else{
                    parseUserstory.status = arrayTaskStatusUniq.length[0];
                }
            }
            else{
                parseUserstory.status = "New";

            }

        }
        else{
            parseUserstory.tasks = [];
            parseUserstory.status = "New";
        }

    }
    else{
        parseUserstory.tasks = [];
        parseUserstory.status = "New";
    }




    return parseUserstory;




};






module.exports = mongoose.model('Userstory', userstorySchema);