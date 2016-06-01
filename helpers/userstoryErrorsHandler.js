/**
 * Created by izaskun on 1/06/16.
 */



var Hope  = require('hope');


exports.checkfields = function(userstory, fieldchange) {

    /* puede cambiar
    *   subject,
    *   sprint (type: Schema.ObjectId):: NO HECHO,
     * voters ([type: Schema.ObjectId]),
     * point (ux,design, front,back),
     * attachments:: NO HECHO,
     * tasks (type: Schema.ObjectId):: NO HECHO
     * tags[String],
     * description,
     * requirement(team, client, blocked */

    var promise = new Hope.Promise();




    if(fieldchange !== 'voters' &&
        fieldchange !== 'point' &&
        fieldchange !== 'attachments' &&
        fieldchange !== 'tasks' &&
        fieldchange !== 'tags' &&
        fieldchange !== 'description' &&
        fieldchange !== 'requirement' &&
        fieldchange !== 'subject' &&
        fieldchange !== 'sprint'){

        var err = {
            code   : 400,
            message: 'Bad Request. Missing required parameters: field that changed mismatch.'
        };
        return promise.done(err, null);

    }
    else{
        if(fieldchange == 'voters'){
            if(userstory.voters == undefined ||
                userstory.voters == null ||
                userstory.voters == '' ){

                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: voters.'
                };
                return promise.done(err, null);

            }
            else{
                return promise.done(null, 1);

            }

        }
        else if(fieldchange == 'point'){
            if(userstory.point == undefined ||
                userstory.point == null ||
                userstory.point == '' ){

                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: point.'
                };
                return promise.done(err, null);

            }
            else{
                return promise.done(null, 2);

            }

        }
        else if(fieldchange == 'attachments'){
            if(userstory.attachments == undefined ||
                userstory.attachments == null ||
                userstory.attachments == '' ){

                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: attachments.'
                };
                return promise.done(err, null);

            }
            else{
                return promise.done(null, 3);

            }

        }
        else if(fieldchange == 'tasks'){
            if(userstory.tasks == undefined ||
                userstory.tasks == null ||
                userstory.tasks == '' ){

                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: tasks.'
                };
                return promise.done(err, null);

            }
            else{
                return promise.done(null, 4);

            }


        }
        else if(fieldchange == 'tags'){
            if(userstory.tags == undefined ||
                userstory.tags == null ||
                userstory.tags == '' ){

                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: tags.'
                };
                return promise.done(err, null);

            }
            else{
                return promise.done(null, 5);

            }


        }
        else if(fieldchange == 'description'){
            if(userstory.description == undefined ||
                userstory.description == null ||
                userstory.description == '' ){

                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: description.'
                };
                return promise.done(err, null);

            }
            else{
                return promise.done(null, 6);

            }

        }
        else if(fieldchange == 'requirement'){
            if(userstory.requirement == undefined ||
                userstory.requirement == null ||
                userstory.requirement == '' ){

                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: requirement.'
                };
                return promise.done(err, null);

            }
            else{
                return promise.done(null, 7);

            }

        }
        else if(fieldchange == 'subject'){
            if(userstory.subject == undefined ||
                userstory.subject == null ||
                userstory.subject == '' ){

                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: subject.'
                };
                return promise.done(err, null);

            }
            else{
                return promise.done(null, 8);

            }

        }
        else if(fieldchange == 'sprint'){
            if(userstory.sprint == undefined ||
                userstory.sprint == null ||
                userstory.sprint == '' ){

                var err = {
                    code   : 400,
                    message: 'Bad Request. Missing required parameters: sprint.'
                };
                return promise.done(err, null);

            }
            else{
                return promise.done(null, 9);

            }

        }
        else{
            var err = {
                code   : 400,
                message: 'Bad Request. Missing required parameters: field that changed mismatch.'
            };
            return promise.done(err, null);

        }

    }



    return promise;

}