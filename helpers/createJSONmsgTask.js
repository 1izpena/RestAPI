/**
 * Created by izaskun on 7/06/16.
 */



exports.generateMSGNewIssue = function generateMSGNewIssue (result, issueresult) {


    var sender = {
        id  : result._id,
        username: result.username,
        mail: result.mail
    };



    var messagetext = {
        action      : 'created',
        event       :  'issue',
        sender      :   sender

    };

    messagetext.issue = {
        id          : issueresult.id,
        num         : issueresult.num,
        subject     : issueresult.subject,
        status      : issueresult.status,
        voters      : issueresult.voters,
        type        : issueresult.type,
        priority    : issueresult.priority,
        severity    : issueresult.severity,
        description : issueresult.description
    };



    return messagetext;

};



exports.generateMSGNewSprint = function generateMSGNewSprint (result, sprintresult) {


    var sender = {
        id  : result._id,
        username: result.username,
        mail: result.mail
    };


    var messagetext = {
        action      :  'created',
        event       :  'sprint',
        sender      :   sender

    };

    messagetext.sprint = {
        id          : sprintresult.id,
        num         : sprintresult.num,
        name        : sprintresult.name,
        startdate   : sprintresult.startdate,
        enddate     : sprintresult.enddate
    };

    return messagetext;




};



exports.generateMSGDeleteSprint = function generateMSGDeleteSprint (result, sprintresult, raw) {


    var sender = {
        id  : result._id,
        username: result.username,
        mail: result.mail
    };


    var messagetext = {
        action      :  'deleted',
        event       :  'sprint',
        sender      :   sender

    };

    messagetext.sprint = {
        id          : sprintresult.id,
        num         : sprintresult.num,
        name        : sprintresult.name,
        startdate   : sprintresult.startdate,
        enddate     : sprintresult.enddate
    };


    if(raw !== undefined && raw !== null && raw !== ''){
        if(raw.nModified !== undefined && raw.nModified !== null && raw.nModified !== ''){
            messagetext.sprint.numuserstories = raw.nModified;

        }

    }

    return messagetext;




};




exports.generateMSGEditSprint = function generateMSGEditSprint (result, sprintexists, sprintresultnew) {

    var sender = {
        id  : result._id,
        username: result.username,
        mail: result.mail
    };


    var messagetext = {
        action      :  'updated',
        event       :  'sprint',
        sender      :   sender

    };

    messagetext.sprint = {
        id          : sprintresultnew.id,
        num         : sprintresultnew.num,
        name        : sprintresultnew.name,
        startdate   : sprintresultnew.startdate,
        enddate     : sprintresultnew.enddate
    };


    messagetext.fieldschange = {};

    messagetext.fieldschange.enddate = sprintexists.enddate;
    messagetext.fieldschange.startdate = sprintexists.startdate;



    return messagetext;


};






exports.generateMSGDeleteUS = function generateMSGDeleteUS (result, userstoryresult, raw) {


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



    if(raw !== undefined && raw !== null && raw !== ''){
        if(raw.nModified !== undefined && raw.nModified !== null && raw.nModified !== ''){
            messagetext.userstory.numissues = raw.nModified;

        }

    }







    return messagetext;




};




exports.generateMSGDeleteIssue = function generateMSGDeleteIssue (result, issueresult) {


    var sender = {
        id  : result._id,
        username: result.username,
        mail: result.mail
    };


    var messagetext = {
        action      :  'deleted',
        event       :  'issue',
        sender      :   sender

    };


    messagetext.issue = {
        id          : issueresult.id,
        num         : issueresult.num,
        subject     : issueresult.subject
    };


    console.log("esto vale issueresult");
    console.log(issueresult);

    /* mirar si tenia us creados a su cargo */
    if(issueresult.userstories !== undefined &&
        issueresult.userstories !== null &&
        issueresult.userstories !== '' &&
        issueresult.userstories.length >0){
        messagetext.issue.numus = issueresult.userstories.length;
        console.log("entro en issue.numus");

    }



    return messagetext;




};





/* userstoryexists es el anterior sin updatear */
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




    /*codepoints.old = sprintresultold;
     condepoints.new = sprintresult;*/
    else if(messagetext.field == 9){
        if(codepoints !== undefined &&
            codepoints !== null &&
            codepoints !== '' ){

            if(codepoints.new !== undefined &&
                codepoints.new !== null &&
                codepoints.new !== '' ){
                messagetext.userstory.sprint = {};
                messagetext.userstory.sprint.id = codepoints.new.id;
                messagetext.userstory.sprint.name = codepoints.new.name;
                messagetext.userstory.sprint.num = codepoints.new.num;

            }
            if(codepoints.old !== undefined &&
                codepoints.old !== null &&
                codepoints.old !== '' ){
                messagetext.codepoints = {};
                messagetext.codepoints.id = codepoints.old.id;
                messagetext.codepoints.name = codepoints.old.name;
                messagetext.codepoints.num = codepoints.old.num;

            }






        }

    }






    return messagetext;




};
















exports.generateMSGNewUS = function generateMSGNewUS (result, userstoryresult, sprintresult) {


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

    if(sprintresult !== null){
        messagetext.sprint = {
            id          : sprintresult.id,
            num         : sprintresult.num,
            name        : sprintresult.name
        };

    }





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
            fieldoldvalue.username = "NONE";

        }
        else if(fieldoldvalue.username == undefined ||
            fieldoldvalue.username == null ||
            fieldoldvalue.username == ''){
            fieldoldvalue.username = "NONE";

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

            /* pero lo acaba de crear, no tendra id */
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

/******************* new **********************************/


exports.generateMSGupdateIssue = function generateMSGupdateIssue (num, result, fieldoldvalue, fieldchange,
                                                                  newissueresult, fieldnewvalue, oldissueresult) {


    var messagetext = {};




    var sender = {};
    var attr = {};
    var issue = {};

    /* 1 assignedto 2 unassignedto */
    if(num == 1 || num == 2 || num == 12 || num == 6 || num == 7 || num == 8 || num == 9 || num == 10 || num == 11 || num == 4){


        sender.id = result._id;
        sender.username = result.username;
        sender.mail = result.mail;



        issue.id = newissueresult.id;
        issue.num = newissueresult.num;
        issue.subject = newissueresult.subject;



    }
    else if(num == 13){
        sender.username = result.username;
        sender.mail = result.mail;


        issue.id = newissueresult.id;
        issue.num = newissueresult.num;
        issue.subject = newissueresult.subject;

        attr.fieldchange = fieldchange;


        messagetext.action = "updated";
        messagetext.event = "issue";
        messagetext.sender = sender;
        messagetext.attr = attr;
        messagetext.issue = issue;

    }

    if(num == 1){


        if(fieldoldvalue == undefined ||
            fieldoldvalue == null ||
            fieldoldvalue == ''){
            fieldoldvalue = {};
            fieldoldvalue.username = "NONE";

        }
        else if(fieldoldvalue.username == undefined ||
            fieldoldvalue.username == null ||
            fieldoldvalue.username == ''){
            fieldoldvalue.username = "NONE";

        }


        attr.fieldchange = fieldchange;
        attr.newfield = newissueresult.assignedto;
        attr.oldfield = fieldoldvalue;



        messagetext.action = "updated";
        messagetext.event = "issue";
        messagetext.sender = sender;
        messagetext.attr = attr;
        messagetext.issue = issue;



        /* hay que meter la tarea x separado para que se sepa cual se ha añadido */







    }/* end num == 1 */
    else if(num == 2 || num == 12 || num == 6 || num == 7 || num == 8 || num == 9 || num == 10 || num == 11 || num == 4 ){



        attr.fieldchange = fieldchange;

        /* unassigned */
        if(num == 2){
            /* tiene que ser undefined */

            attr.newfield = newissueresult.assignedto;
            attr.oldfield = fieldoldvalue;

        }
        else if( num == 12){
            /* miramos si el que ha enviado la peticion esta en el array o no
             * si no esta, es que ha quitado el voto, si esta es que lo ha metido, esto para mandar el mensaje  */

            var votes = -1;
            if(newissueresult.voters !== undefined &&
                newissueresult.voters !== null &&
                newissueresult.voters !== '' &&
                newissueresult.voters.length >0 ){

                votes = newissueresult.voters.indexOf(result._id);


            }
            attr.newfield = newissueresult.voters.length;
            // oldfield seria el index
            attr.oldfield = votes;

        }
        else if(num == 7){
            /* tiene que ser undefined */

            attr.newfield = newissueresult.description;


        }
        else if(num == 8){
            attr.newfield = newissueresult.type;
            attr.oldfield = oldissueresult.type;


        }
        else if(num == 9){
            attr.newfield = newissueresult.severity;
            attr.oldfield = oldissueresult.severity;


        }
        else if(num == 10){
            attr.newfield = newissueresult.priority;
            attr.oldfield = oldissueresult.priority;


        }
        else if(num == 11){
            attr.newfield = newissueresult.status;
            attr.oldfield = oldissueresult.status;


        }
        else if(num == 4){ /* new comment, si quieres ir te pongo los medios */

            attr.newfield = fieldnewvalue;
        }








        messagetext.action = "updated";
        messagetext.event = "issue";
        messagetext.sender = sender;
        messagetext.attr = attr;
        messagetext.issue = issue;







    }





    return messagetext;


};












