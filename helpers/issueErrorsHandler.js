/**
 * Created by izaskun on 18/06/16.
 */



exports.checkfields = function checkfields (fieldnewvalue, fieldchange, fieldoldvalue) {

    /* puede cambiar
     *   de momento assignedto con objecto json id
     *   assignedto      : { type: Schema.ObjectId, ref: 'User', required: false },*/


    var answer = {};
    answer.err = {};
    answer.num = 0;


    /* assignedto,
     unassignedto,
     status,
     severity,
     priority,
     type,
     description,
     subject,
     votes
     comments */



    if(fieldchange !== 'assignedto' &&
        fieldchange !== 'unassignedto' &&
        fieldchange !== 'attachments' &&
        fieldchange !== 'comments' &&
        fieldchange !== 'description' &&
        fieldchange !== 'subject' &&
        fieldchange !== 'type' &&
        fieldchange !== 'severity' &&
        fieldchange !== 'priority' &&
        fieldchange !== 'status' &&
        fieldchange !== 'uncomment'&&
        fieldchange !== 'voters' &&
        fieldchange !== 'userstories'){




        answer.err.code = 400;
        answer.err.message = 'Bad Request. Missing required parameters: field that changed mismatch.';



    }
    else{
        if(fieldchange == 'assignedto'){

            answer.num = 1;



        }
        else if(fieldchange == 'unassignedto'){

            answer.num = 2;




        }
        else if(fieldchange == 'attachments'){
            if( Object.prototype.toString.call( fieldnewvalue) !== '[object Array]' ){


                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: attachments.';



            }
            else{
                answer.num = 3;


            }


        }
        /* coments mandamos 1 objeto comment que tiene que tener
         *
         * [{
         comment: String,
         _user:{ type: Schema.ObjectId, ref: 'User'},
         created: { type: Date, default: Date.now }, esto lo hacemos en el controller
         }],
         *
         *
         * */
        else if(fieldchange == 'comments'){

            /* _user no hace falta, lo montamos en el controller */

            answer.num = 4;



        }
        else if(fieldchange == 'uncomment'){

            answer.num = 5;




        }
        else if(fieldchange == 'subject'){

            answer.num = 6;




        }
        else if(fieldchange == 'description'){

            answer.num = 7;




        }
        else if(fieldchange == 'type'){

            answer.num = 8;




        }
        else if(fieldchange == 'severity'){

            answer.num = 9;




        }
        else if(fieldchange == 'priority'){

            answer.num = 10;




        }
        else if(fieldchange == 'status'){

            answer.num = 11;




        }

        else if(fieldchange == 'voters') {

            if (Object.prototype.toString.call(fieldnewvalue) !== '[object Array]') {

                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: voters.';


            }
            else {
                answer.num = 12;


            }

        }
        else if(fieldchange == 'userstories'){

            answer.num = 13;




        }

        else{

            answer.err.code = 400;
            answer.err.message = 'Bad Request. Missing required parameters: field that changed mismatch.';


        }


    }

    return answer;


};