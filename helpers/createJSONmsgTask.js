/**
 * Created by izaskun on 7/06/16.
 */






exports.generateMSGDeleteUS = function generateMSGDeleteUS (result, userstoryresult) {


    var sender = {
        id  : result._id,
        username: result.username,
        mail: result.mail
    };


    var messagetext = {
        action      :  'deleted',
        event       :  'userstory',
        sender      :   sender

    };

    messagetext.userstory = {
        id          : userstoryresult.id,
        num         : userstoryresult.num,
        subject     : userstoryresult.subject,
        numtasks    : userstoryresult.tasks
    };

    return messagetext;




};










exports.generateMSGUpdateUS = function generateMSGUpdateUS (result, userstoryresult, codefield, codepoints) {






    var sender = {
        id  : result._id,
        username: result.username,
        mail: result.mail
    };



    /* quizas no habria que mandar all del userstory
     * mandamos mejor solo el id del userstory y si lo quieren ver que hagan 1 get y a correr */

    /* yo le meteria el userstory sin referencias externas */
    var messagetext = {
        action      :  'updated',
        field       :   codefield,
        event       :  'userstory',
        sender      :   sender

    };

    messagetext.userstory = {
        id          : userstoryresult.id,
        num         : userstoryresult.num,
        subject     : userstoryresult.subject,
        tags        : userstoryresult.tags,
        status      : userstoryresult.status,
        /* array con id de user*/
        /* si dejo hacerlo en la creacion */
        voters      : userstoryresult.voters,
        point       : userstoryresult.point,
        totalPoints : userstoryresult.totalPoints,
        description : userstoryresult.description,
        requirement : userstoryresult.requirement
    };


    /* point, tags, requirement*/
    if(messagetext.field == 2 ||
        messagetext.field == 5 ||
        messagetext.field == 7){
        if(codepoints !== undefined &&
            codepoints !== null &&
            codepoints !== '' ){
            messagetext.codepoints = codepoints;


        }
    }






    return messagetext;




};
















exports.generateMSGNewUS = function generateMSGNewUS (result, userstoryresult) {


    var sender = {
        id  : result._id,
        username: result.username,
        mail: result.mail
    };



    /* quizas no habria que mandar all del userstory
     * mandamos mejor solo el id del userstory y si lo quieren ver que hagan 1 get y a correr */

    /* yo le meteria el userstory sin referencias externas */
    var messagetext = {
        action      : 'created',
        event       :  'userstory',
        sender      :   sender

    };

    messagetext.userstory = {
        id          : userstoryresult.id,
        num         : userstoryresult.num,
        subject     : userstoryresult.subject,
        tags        : userstoryresult.tags,
        status      : userstoryresult.status,
        /* array con id de user*/
        /* si dejo hacerlo en la creacion */
        voters      : userstoryresult.voters,
        points      : userstoryresult.points,
        totalPoints : userstoryresult.totalPoints,
        description : userstoryresult.description,
        requirement : userstoryresult.requirement
    };


    return messagetext;

};




exports.generateMSGRemoveTask = function generateMSGRemoveTask (result, userstoryresult, taskresult) {

    var sender = {
        id: result._id,
        username: result.username,
        mail: result.mail
    };

    var messagetext = {
        action      : 'deleted',
        event       :  'task',
        sender      :   sender

    };

    messagetext.userstory = {
        id          : userstoryresult.id,
        num         : userstoryresult.num,
        subject     : userstoryresult.subject
    };


    /* si el status del userstory ha cambiado hay que notificarlo */
    messagetext.task = {
        id          : taskresult.id,
        num         : taskresult.num,
        subject     : taskresult.subject

    };

    return messagetext;

};




exports.generateMSGnew = function generateMSGnew (result, userstoryresultchanged, taskresult) {

    var sender = {
        id  : result._id,
        username: result.username,
        mail: result.mail
    };



/* quizas no habria que mandar all del userstory
 * mandamos mejor solo el id del userstory y si lo quieren ver que hagan 1 get y a correr */

/* yo le meteria el userstory sin referencias externas */

     var messagetext = {
     action      : 'created',
     event       :  'task',
     sender      :   sender

     };

 /* hay que meter la tarea x separado para que se sepa cual se ha añadido */

     messagetext.userstory = {
     id          : userstoryresultchanged.id,
     num         : userstoryresultchanged.num,
     subject     : userstoryresultchanged.subject
     };


 /* si el status del userstory ha cambiado hay que notificarlo */
     messagetext.task = {
     id          : taskresult.id,
     num         : taskresult.num,
     subject     : taskresult.subject,
     status      : taskresult.status,
     description : taskresult.description,
     requirement : taskresult.requirement

     };

    return messagetext;

};



exports.generateMSGnewStatusChange = function generateMSGnewStatusChange (userstoryresultchanged, userstoryresult, taskresult) {

    var messagetext2 = {
        action      : 'updated',
        event       :  'userstory',
        field       :   10

    };

    var codepoints = {
        from    : userstoryresult.status,
        to      : userstoryresultchanged.status

    };

    messagetext2.codepoints = codepoints;


    /* hay que meter la tarea x separado para que se sepa cual se ha añadido */
    messagetext2.userstory = {
        id          : userstoryresultchanged.id,
        num         : userstoryresultchanged.num,
        subject     : userstoryresultchanged.subject
    };


    /* si el status del userstory ha cambiado hay que notificarlo */
    messagetext2.task = {
        id          : taskresult.id,
        num         : taskresult.num,
        subject     : taskresult.subject
    };

    return messagetext2;

};


exports.generateMSGupdateTask = function generateMSGupdateTask (num, result, fieldoldvalue, fieldchange, newtaskresult, userstoryresult, fieldnewvalue) {


    var messagetext = {};



    console.log("esto valen los parametros");
    console.log("num");
    console.log(num);
    console.log("result");
    console.log(result);
    console.log("fieldoldvalue");
    console.log(fieldoldvalue);
    console.log("fieldchange");
    console.log(fieldchange);
    console.log("newtaskresult");
    console.log(newtaskresult);
    console.log("userstoryresult");
    console.log(userstoryresult);



    var sender = {};
    var attr = {};

    if(num == 1 || num == 7 || num == 5 || num == 6 || num == 8 || num == 9 || num == 2 || num == 10 || num == 4){


        sender.id = result._id;
        sender.username = result.username;
        sender.mail = result.mail;


    }

    if(num == 1){


        if(fieldoldvalue == undefined ||
            fieldoldvalue == null ||
            fieldoldvalue == ''){
            fieldoldvalue = {};
            fieldoldvalue.username = "None";

        }
        else if(fieldoldvalue.username == undefined ||
            fieldoldvalue.username == null ||
            fieldoldvalue.username == ''){
            fieldoldvalue.username = "None";

        }


        attr.fieldchange = fieldchange;
        attr.newfield = newtaskresult.assignedto;
        attr.oldfield = fieldoldvalue;



        messagetext.action = "updated";
        messagetext.event = "task";
        messagetext.sender = sender;
        messagetext.attr = attr;



        /* hay que meter la tarea x separado para que se sepa cual se ha añadido */

        messagetext.userstory = {
            id          : userstoryresult.id,
            num         : userstoryresult.num,
            subject     : userstoryresult.subject
        };


        /* si el status del userstory ha cambiado hay que notificarlo */
        messagetext.task = {
            id          : newtaskresult.id,
            num         : newtaskresult.num,
            subject     : newtaskresult.subject,
            status      : newtaskresult.status,
            description : newtaskresult.description,
            requirement : newtaskresult.requirement

        };


        console.log("esto vale el mensaje en createJSONMSG");
        console.log(messagetext);


    }/* end num == 1 */

    else if(num == 7 || num == 5 || num == 6 || num == 8 || num == 9 || num == 2 || num == 10 || num == 4){



        attr.fieldchange = fieldchange;

        if(num == 7){
            attr.newfield = newtaskresult.subject;

        }
        else if(num == 5){
            attr.newfield = newtaskresult.description;

        }
        /* en este caso fieldchange es requirement
        * y old value el requieremnt a cambiar */
        else if(num == 6){
            attr.newfield = newtaskresult.requirement;
            attr.oldfield = fieldoldvalue;

        }

        else if(num == 8){
            attr.newfield = newtaskresult.status;


            /* y recojo el old value */
            /* tenemos el userstory antes de modificar la tarea creo */

            if(userstoryresult.tasks !== undefined && userstoryresult.tasks.length >0){
                for(var i = 0; i< userstoryresult.tasks.length; i++){

                    if(userstoryresult.tasks[i].id.equals(newtaskresult.id)){
                        console.log("en cambiar en status helper ha encontrado la tarea");
                        console.log("esto valia antes");
                        console.log(userstoryresult.tasks[i].status);

                        console.log("esto valia ahora");
                        console.log(newtaskresult.status);

                        attr.oldfield = userstoryresult.tasks[i].status;

                        i = userstoryresult.tasks.length;

                    }


                }

            }


        }
        else if(num == 9){
            /* tiene que ser undefined */

            attr.newfield = newtaskresult.assignedto;
            attr.oldfield = fieldoldvalue;

        }
        else if(num == 2){
            /* buscamos en el array de contributors parseado que elemento coincide con el que queremos
            * entonces lo metemos en attr.newfield */

            if(newtaskresult.contributors !== undefined && newtaskresult.contributors.length > 0){

                 for(var i = 0; i< newtaskresult.contributors.length; i++){

                    if(newtaskresult.contributors[i].id.equals(fieldnewvalue)){

                        attr.newfield = newtaskresult.contributors[i];
                        i = newtaskresult.contributors.length;

                    }
                }
            }

        }
        else if(num == 10){
            /* tiene que ser undefined */

            attr.newfield = fieldnewvalue;
        }
        else if(num == 4){ /* new comment, si quieres ir te pongo los medios */

            attr.newfield = fieldnewvalue;
        }


        messagetext.action = "updated";
        messagetext.event = "task";
        messagetext.sender = sender;
        messagetext.attr = attr;


        /* hay que meter la tarea x separado para que se sepa cual se ha añadido */
        messagetext.userstory = {
            id          : userstoryresult.id,
            num         : userstoryresult.num,
            subject     : userstoryresult.subject
        };



        messagetext.task = {
            id          : newtaskresult.id,
            num         : newtaskresult.num,
            subject     : newtaskresult.subject,
            status      : newtaskresult.status,
            description : newtaskresult.description,
            requirement : newtaskresult.requirement,
            assignedto  : newtaskresult.assignedto,
            contributors : newtaskresult.contributors

        };




    }
    return messagetext;


};

