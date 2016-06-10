/**
 * Created by izaskun on 6/06/16.
 */

/* var field = 'unassignedto';

 var oldvalue = task.assignedto;
 var newvalue = {};
  */




exports.checkiscontributor = function checkiscontributor (userstoryresult, taskid, fieldnewvalue) {

    /* buscamos la tarea */

    var ismatched = false;
    for( var i= 0; i< userstoryresult.tasks.length; i++){

        if(userstoryresult.tasks[i].id.equals(taskid)){
            console.log("ha tenido que encontrar la tarea con assigned to como fielchange ");


            console.log(userstoryresult.tasks[i]);
            if(userstoryresult.tasks[i].contributors !== undefined &&
                userstoryresult.tasks[i].contributors !== null &&
                userstoryresult.tasks[i].contributors !== '' &&
                userstoryresult.tasks[i].contributors.length > 0){

                for(var j= 0; j< userstoryresult.tasks[i].contributors.length; j++){

                    if(userstoryresult.tasks[i].contributors[j].id.equals(fieldnewvalue)){
                        console.log("ha encontrado la tarea con contributors member");
                        ismatched = true;
                        j= userstoryresult.tasks[i].contributors.length;
                        i = userstoryresult.tasks.length-1;
                    }

                }




            }



        }
        else{
            console.log("no ha encontrado la tarea");
        }

    }
    return ismatched;



};





exports.checkisassignedorcontributor = function checkisassignedorcontributor (userstoryresult, taskid, fieldnewvalue) {

    /* buscamos la tarea */

    var ismatched = false;
    for( var i= 0; i< userstoryresult.tasks.length; i++){

        if(userstoryresult.tasks[i].id.equals(taskid)) {
            console.log("ha tenido que encontrar la tarea");


            if (userstoryresult.tasks[i].assignedto !== undefined &&
                userstoryresult.tasks[i].assignedto !== null &&
                userstoryresult.tasks[i].assignedto !== '') {

                if (userstoryresult.tasks[i].assignedto.id.equals(fieldnewvalue)) {
                    console.log("ha encontrado la tarea con assignedtocomo member");
                    ismatched = true;
                    i = userstoryresult.tasks.length;


                }
                else {
                    if (userstoryresult.tasks[i].contributors !== undefined &&
                        userstoryresult.tasks[i].contributors !== null &&
                        userstoryresult.tasks[i].contributors !== '' &&
                        userstoryresult.tasks[i].contributors.length > 0) {


                        for (var j = 0; j < userstoryresult.tasks[i].contributors; j++) {
                            if (userstoryresult.tasks[i].contributors[j].id == fieldnewvalue) {
                                console.log("ha encontrado la tarea con contributors member");
                                ismatched = true;
                                j = userstoryresult.tasks[i].contributors.length;
                                i = userstoryresult.tasks.length;
                            }

                        }
                    }


                }
            }
        }

    }
    return ismatched;



};



exports.checkfields = function checkfields (fieldnewvalue, fieldchange, fieldoldvalue) {

    /* puede cambiar
     *   de momento assignedto con objecto json id
      *   assignedto      : { type: Schema.ObjectId, ref: 'User', required: false },*/


    var answer = {};
    answer.err = {};
    answer.num = 0;




    if(fieldchange !== 'assignedto' &&
        fieldchange !== 'unassignedto' &&
        fieldchange !== 'contributors' &&
        fieldchange !== 'uncontributors' &&
        fieldchange !== 'attachments' &&
        fieldchange !== 'comments' &&
        fieldchange !== 'description' &&
        fieldchange !== 'requirement' &&
        fieldchange !== 'subject' &&
        fieldchange !== 'status' &&
        fieldchange !== 'uncomment'){




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
            answer.num = 2;
            return answer;




        }
        else if(fieldchange == 'attachments'){
            if( Object.prototype.toString.call( fieldnewvalue) !== '[object Array]' ){


                answer.err.code = 400;
                answer.err.message = 'Bad Request. Missing required parameters: attachments.';



            }
            else{
                answer.num = 3;


            }
            return answer;

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

            return answer;


        }
        else if(fieldchange == 'description'){

            answer.num = 5;
            return answer;



        }

        /* mirar que lo que tiene en old value existe */
        else if(fieldchange == 'requirement'){

            if(fieldoldvalue == 'blocked'){
                if(fieldnewvalue.blocked !== undefined &&
                    fieldnewvalue.blocked !== '' &&
                    fieldnewvalue.blocked !== null ){

                    answer.num = 6;


                }
                else {
                    answer.err.code = 400;
                    answer.err.message = 'Bad Request. Missing required parameters: requirement blocked value.';

                }
            }
            else if(fieldoldvalue == 'iocaine'){
                if(fieldnewvalue.iocaine !== undefined &&
                    fieldnewvalue.iocaine !== '' &&
                    fieldnewvalue.iocaine !== null ){

                    answer.num = 6;


                }
                else {
                    answer.err.code = 400;
                    answer.err.message = 'Bad Request. Missing required parameters: requirement power value.';

                }
            }


            return answer;



        }
        else if(fieldchange == 'subject'){

            answer.num = 7;
            return answer;



        }
        else if(fieldchange == 'status'){

            answer.num = 8;
            return answer;



        }
        else if(fieldchange == 'unassignedto'){

            answer.num = 9;
            return answer;



        }
        else if(fieldchange == 'uncontributors'){

            answer.num = 10;
            return answer;



        }
        else if(fieldchange == 'uncomment'){

            answer.num = 11;
            return answer;



        }
        else{

            answer.err.code = 400;
            answer.err.message = 'Bad Request. Missing required parameters: field that changed mismatch.';
            return answer;

        }

    }


};