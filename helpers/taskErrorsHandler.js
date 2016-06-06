/**
 * Created by izaskun on 6/06/16.
 */




exports.checkfields = function checkfields (fieldnewvalue, fieldchange) {

    /* puede cambiar
     *   de momento assignedto con objecto json id
      *   assignedto      : { type: Schema.ObjectId, ref: 'User', required: false },*/


    var answer = {};
    answer.err = {};
    answer.num = 0;




    if(fieldchange !== 'assignedto' &&
        fieldchange !== 'contributors' &&
        fieldchange !== 'attachments' &&
        fieldchange !== 'comments' &&
        fieldchange !== 'description' &&
        fieldchange !== 'requirement' &&
        fieldchange !== 'subject'){




        answer.err.code = 400;
        answer.err.message = 'Bad Request. Missing required parameters: field that changed mismatch.';

        return answer;

    }
    else{
        if(fieldchange == 'assignedto'){

            /* mirar que existe el usuario en elcanal ?? */
            /* memanda esto fieldnewvalue = memberid; */

            answer.num = 1;
            return answer;


        }
        /* debemos mandar el array completo */
        else if(fieldchange == 'contributors'){
            if( Object.prototype.toString.call( fieldnewvalue) !== '[object Array]' ){


                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: contributors.';
                return answer;

            }
            else{
                answer.num = 2;
                return answer;

            }




        }
        else if(fieldchange == 'attachments'){
            if( Object.prototype.toString.call( fieldnewvalue) !== '[object Array]' ){


                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: attachments.';

                return answer;

            }
            else{
                answer.num = 3;
                return answer;

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
            if(fieldnewvalue.comment == undefined ||
                fieldnewvalue.comment == null ||
                fieldnewvalue.comment == '' ){

                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: comment text.';

                return answer;

            }
            else{
                answer.num = 4;
                return answer;

            }


        }
        else if(fieldchange == 'description'){

            answer.num = 5;
            return answer;



        }

        else if(fieldchange == 'requirement'){

            answer.num = 6;
            return answer;



        }
        else if(fieldchange == 'subject'){

            answer.num = 7;
            return answer;



        }
        else{

            answer.err.code = 400;
            answer.err.message = 'Bad Request. Missing required parameters: field that changed mismatch.';
            return answer;

        }

    }


};