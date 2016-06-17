/**
 * Created by izaskun on 1/06/16.
 */



/*var Hope  = require('hope');*/


exports.checkfields = function checkfields (userstory, fieldchange) {

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


    var answer = {};
    answer.err = {};
    answer.num = 0;





    if(fieldchange !== 'voters' &&
        fieldchange !== 'point' &&
        fieldchange !== 'attachments' &&
        fieldchange !== 'tasks' &&
        fieldchange !== 'tags' &&
        fieldchange !== 'description' &&
        fieldchange !== 'requirement' &&
        fieldchange !== 'subject' &&
        fieldchange !== 'sprint' &&
        fieldchange !== 'unsprint'){


        answer.err.code = 400;
        answer.err.message = 'Bad Request. Missing required parameters: field that changed mismatch.';

        return answer;

    }
    else{
        if(fieldchange == 'voters'){
            console.log("esto vale userstory.voters");
            console.log(userstory.voters);

            if(userstory.voters == undefined ||
                userstory.voters == null ||
                Object.prototype.toString.call( userstory.voters) !== '[object Array]'){

                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: voters.';



            }
            else{
                answer.num = 1;


            }
            return answer;

        }
        else if(fieldchange == 'point'){
            if(userstory.point == undefined ||
                userstory.point == null ||
                userstory.point == '' ){

                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: point.';


            }
            else{
                answer.num = 2;


            }
            return answer;

        }
        else if(fieldchange == 'attachments'){
            if(userstory.attachments == undefined ||
                userstory.attachments == null ||
                Object.prototype.toString.call( userstory.attachments) !== '[object Array]' ){


                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: attachments.';



            }
            else{
                answer.num = 3;


            }
            return answer;

        }
        else if(fieldchange == 'tasks'){
            if(userstory.tasks == undefined ||
                userstory.tasks == null ||
                Object.prototype.toString.call( userstory.tasks) !== '[object Array]' ){


                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: tasks.';


            }
            else{
                answer.num = 4;


            }
            return answer;


        }
        else if(fieldchange == 'tags'){
            if(userstory.tags == undefined ||
                userstory.tags == null ||
                Object.prototype.toString.call( userstory.tags) !== '[object Array]' ){


                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: tags.';



            }
            else{
                answer.num = 5;


            }
            return answer;


        }
        else if(fieldchange == 'description'){
            if(userstory.description == undefined ||
                userstory.description == null ||
                userstory.description == '' ){


                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: description.';


            }
            else{
                answer.num = 6;


            }
            return answer;

        }
        else if(fieldchange == 'requirement'){
            if(userstory.requirement == undefined ||
                userstory.requirement == null ||
                userstory.requirement == '' ){


                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: requirement.';

            }
            else{
                answer.num = 7;


            }
            return answer;

        }
        else if(fieldchange == 'subject'){
            if(userstory.subject == undefined ||
                userstory.subject == null ||
                userstory.subject == '' ){

                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: subject.';

            }
            else{
                answer.num = 8;


            }
            return answer;

        }
        else if(fieldchange == 'sprint'){
            if(userstory.sprint == undefined ||
                userstory.sprint == null ||
                userstory.sprint == '' ){


                err.code = 400;
                err.message = 'Bad Request. Missing required parameters: sprint.';

            }
            else{
                answer.num = 9;


            }
            return answer;

        }
        else if(fieldchange == 'unsprint'){

            answer.num = 10;
            return answer;

        }
        else{

            answer.err.code = 400;
            answer.err.message = 'Bad Request. Missing required parameters: field that changed mismatch.';
            return answer;

        }

    }


};