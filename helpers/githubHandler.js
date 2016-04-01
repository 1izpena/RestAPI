/**
 * Created by izaskun on 31/03/16.
 */



var User = require('../models/user');
var Group = require('../models/group');
var Channel = require('../models/channel');
var mongoose = require('mongoose');
var Hope  = require('hope');




function getFieldsRepositoryForPush (repository) {



    if(repository.id !== undefined &&
        repository.id !== null &&
        repository.name !== undefined &&
        repository.name !== null){

        var repositoryTemp = {};


        repositoryTemp.id = repository.id;
        repositoryTemp.name = repository.name;


        return repositoryTemp;


    }
    else{
        return null;
    }


}





/*****************************/
function getFieldsRepository (repository) {



    if(repository.id !== undefined &&
        repository.id !== null &&
        repository.name !== undefined &&
        repository.name !== null){

        var repositoryTemp = {};


        repositoryTemp.id = repository.id;
        repositoryTemp.name = repository.name;


        if(repository.default_branch !== undefined && repository.default_branch !== null){
            repositoryTemp.default_branch = repository.default_branch;

        }

        return repositoryTemp;


    }
    else{
        return null;
    }


}



function getFieldsIssueForComment (issue) {

    /* solo quiero id, title y number */
    var issueTemp = {};

    if(issue.number !== undefined &&
        issue.number !== null ){

        issueTemp.number = issue.number;

        if(issue.title !== undefined && issue.title !== null){
            issueTemp.title = issue.title;

        }

        return issueTemp;


    } /* end if existe issue con id y html */
    else{
        return null;
    }


}



/* para cuando el action es assigned */
function getFieldsIssueAssigned (issue) {


    var issueTemp = {};

    if(issue.number !== undefined &&
        issue.number !== null &&
        issue.html_url !== undefined &&
        issue.html_url !== null){

        issueTemp.number = issue.number;
        issueTemp.html_url = issue.html_url;

        if(issue.title !== undefined && issue.title !== null){
            issueTemp.title = issue.title;

        }
        else{
            issueTemp.title = "";
        }

        if(issue.state !== undefined && issue.state !==  null){
            issueTemp.state = issue.state;

        }

        if(issue.milestone !== undefined && issue.milestone !== null){



            if(issue.milestone.number !== undefined && issue.milestone.number !== null){
                issueTemp.milestone = {};
                issueTemp.milestone.number = issue.milestone.number;

                if(issue.milestone.title !== undefined && issue.milestone.title !== null){

                    issueTemp.milestone.title = issue.milestone.title;

                }

            }



        }
        if(issue.assignee !== undefined && issue.assignee !== null){


            if(issue.assignee.login !== undefined && issue.assignee.login !== null &&
                issue.assignee.html_url !== undefined && issue.assignee.html_url !== null)
            {
                issueTemp.assignee = {};
                issueTemp.assignee.login = issue.assignee.login;
                issueTemp.assignee.html_url = issue.assignee.html_url;





            }


        }

        if(issue.body !== undefined && issue.body !== null){
            issueTemp.body = issue.body;

        }
        else{
            issueTemp.body = "";
        }

        return issueTemp;


    } /* end if existe issue con id y html */
    else{
        return null;
    }

}




function getFieldsIssue (issue) {


    var issueTemp = {};

    if(issue.number !== undefined &&
        issue.number !== null &&
        issue.html_url !== undefined &&
        issue.html_url !== null){

        issueTemp.number = issue.number;
        issueTemp.html_url = issue.html_url;

        if(issue.title !== undefined && issue.title !== null){
            issueTemp.title = issue.title;

        }
        else{
            issueTemp.title = "";
        }

        if(issue.state !== undefined && issue.state !==  null){
            issueTemp.state = issue.state;

        }

        if(issue.milestone !== undefined && issue.milestone !== null){



            if(issue.milestone.number !== undefined && issue.milestone.number !== null){
                issueTemp.milestone = {};
                issueTemp.milestone.number = issue.milestone.number;

                if(issue.milestone.title !== undefined && issue.milestone.title !== null){

                    issueTemp.milestone.title = issue.milestone.title;

                }

            }



        }

        if(issue.body !== undefined && issue.body !== null){
            issueTemp.body = issue.body;

        }
        else{
            issueTemp.body = "";
        }

        return issueTemp;


    } /* end if existe issue con id y html */
    else{
        return null;
    }

}



/* del comment quiero html_url y body */
function getFieldsCommentIssue (comment) {

    /* creo que asi es undefined */
    var commentTemp = {};

    if(comment.body !== undefined &&
        comment.body !== null &&
        comment.html_url !== undefined &&
        comment.html_url !== null){


        commentTemp.body = comment.body;
        commentTemp.html_url = comment.html_url;


        return commentTemp;


    }
    else{

        return null;
    }

}

/****************/

function getFieldsCommitsArray (commits) {

    /* esto si que hay que convertirlo ha string */
    /* si solo es 1 commit hay que mirar que pasa */
    var commitsTemps = {};
    var objTemp = {};

    for(var i = 0; i < commits.length && i<5; i++){

        console.log("esto vale commits[0]");
        console.log(JSON.stringify(commits[i]));



        if(commits[i].id !== undefined && commits[i].id !== null){

            objTemp.id = commits[i].id;

        }
        else {
            return null
        }



        if(commits[i].url !== undefined && commits[i].url !== null){
            objTemp.url = commits[i].url;
        }
        else {
            return null
        }
        if(commits[i].author !== undefined && commits[i].author !== null){
            if(commits[i].author.username !== undefined && commits[i].author.username !== null){


                objTemp.author = commits[i].author.username;
            }
            else {
                return null
            }

        }
        else {
            return null
        }
        if(commits[i].message !== undefined && commits[i].message !== null){
            objTemp.message = commits[i].author.message;

        }

        commitsTemps.push(objTemp);


    }



    return commitsTemps;

}










/**************************************/
function getFieldsCommits (commits) {

    /* esto si que hay que convertirlo ha string */
    /* si solo es 1 commit hay que mirar que pasa */
    var commitsTemps = "";
    if(commits.length == 1){


        commitsTemps = "commits: {";

        for(var i = 0; i < commits.length; i++){

                console.log("esto vale commits[0]");
                console.log(JSON.stringify(commits[i]));
                if(commits[i].id !== undefined && commits[i].id !== null){
                    commitsTemps = commitsTemps+ "id: " + commits[i].id;
                }
                else {
                    return null
                }

            }

            if(commits[i].url !== undefined && commits[i].url !== null){
                commitsTemps = commitsTemps+ ",url:" + commits[i].url;
            }
            else {
                return null
            }
            if(commits[i].author !== undefined && commits[i].author !== null){
                if(commits[i].author.username !== undefined && commits[i].author.username !== null){
                    commitsTemps = commitsTemps+ ",author:" + commits[i].author.username;
                }
                else {
                    return null
                }

            }
            else {
                return null
            }
            if(commits[i].message !== undefined && commits[i].message !== null){
                commitsTemps = commitsTemps+ ",message:" + commits[i].message + "}";

            }

    }
    /* si es array tiene mas de 1 commit */
    else{
        commitsTemps = "commits: [{";

        for(var i = 0; i < commits.length; i++){

            if(i> 0){
                if(commits[i].id !== undefined && commits[i].id !== null){
                    commitsTemps = commitsTemps+ ",{id: " + commits[i].id;
                }
                else {
                    return null
                }

            }
            else{
                if(commits[i].id !== undefined && commits[i].id !== null){
                    commitsTemps = commitsTemps+ "id: " + commits[i].id;
                }
                else {
                    return null
                }

            }

            if(commits[i].url !== undefined && commits[i].url !== null){
                commitsTemps = commitsTemps+ ",url:" + commits[i].url;
            }
            else {
                return null
            }
            if(commits[i].author !== undefined && commits[i].author !== null){
                if(commits[i].author.username !== undefined && commits[i].author.username !== null){
                    commitsTemps = commitsTemps+ ",author:" + commits[i].author.username;
                }
                else {
                    return null
                }

            }
            else {
                return null
            }
            if(commits[i].message !== undefined && commits[i].message !== null){
                commitsTemps = commitsTemps+ ",message:" + commits[i].message;

            }


            if(i == commits.length-1){
                commitsTemps = commitsTemps + "}]"

            }
            else{
                commitsTemps = commitsTemps + "}"


            }


        }


    }
    return commitsTemps;






}




/******* Quitar *********/

function getFieldsHeadCommit (headcommit) {

    /* creo que asi es undefined */
    var headcommitTemp = {};

    if(headcommit.id !== undefined &&
        headcommit.id !== null &&
        headcommit.url !== undefined &&
        headcommit.url !== null){


        headcommitTemp.id = headcommit.id;
        headcommitTemp.url = headcommit.url;



        if(headcommit.message !== undefined && headcommit.message !== null){
            headcommitTemp.message = headcommit.message;

        }

        if(headcommit.author !== undefined && headcommit.author !== null){
            if(headcommit.author.username !== undefined && headcommit.author.username !== null){
                headcommitTemp.author.username = headcommit.author.username;

            }

        }


        return headcommitTemp;


    }
    else{
        return null;
    }

}




function getFieldsCommentCommit (comment) {

    /* creo que asi es undefined */
    var commentTemp = {};

    if( comment.html_url !== undefined &&
        comment.html_url !== null &&
        comment.commit_id !== undefined &&
        comment.commit_id !== null){


        commentTemp.html_url = comment.html_url;
        commentTemp.commit_id = comment.commit_id;

        if(comment.body !== undefined && comment.body !== null){
            commentTemp.body = comment.body;

        }

        return commentTemp;


    }
    else{
        return null;
    }

}




function getFieldsSender (sender) {

    /* creo que asi es undefined */
    var senderTemp = {};

    if(sender.login !== undefined &&
        sender.login !== null &&
        sender.html_url !== undefined &&
        sender.html_url !== null){


        senderTemp.login = sender.login;
        senderTemp.html_url = sender.html_url;

        return senderTemp;


    }
    else{
        return null;
    }

}



/* issues*/
function createResponseIssues (obj) {
    var obj2 = {};

    var mensaje;
    var state = "";
    var milestone = "";

    if(obj.issue.state !== undefined){
        state = "<state>" + obj.issue.state;

    }
    if(obj.issue.milestone !== undefined){
        milestone = "<br>#" +
            obj.milestone.number + "Milestone: " + obj.milestone.title;

    }



    if(obj.action == "assigned"){
        /* cambiamos el mensaje poniendo assignee */



        mensaje=  obj.assignee.html_url +
                "<url>"+ obj.sender.html_url +
                "<url>"+ obj.issue.html_url +
                "<url>[" + obj.repository.name + ":" +

                obj.repository.default_branch + "] Issue "+ obj.action +
                " to <a>" + obj.assignee.login +
                "<a> (by<a>" + obj.sender.login + "<a>)" +
                "<br><a>#" + obj.issue.number + " " + obj.issue.title +
                " <a> " + obj.issue.body + milestone +
                state;





    }
    else{

            mensaje= obj.sender.html_url +
                "<url>"+ obj.issue.html_url +
                "<url>[" + obj.repository.name + ":" +
                obj.repository.default_branch + "] Issue "+ obj.action +
                " by <a>" + obj.sender.login + "<a>" +
                "<br><a>#" + obj.issue.number + " " + obj.issue.title +
                " <a> " + obj.issue.body + milestone + state;


    }
    obj2.message = mensaje;
    obj2.repoId = obj.repository.id;

    return obj2;


}


/* comment_issue */




/* issues*/
function createResponseCommentIssue (obj) {
    var obj2 = {};

    /* tenemos: siempre y no pueden ser vacios
    * action
    * issue
    * comment
    * repository
    * sender
    * */
    var mensaje;


        mensaje= obj.comment.html_url +
            "<url>"+ obj.sender.html_url +
            "<url>[" + obj.repository.name + ":" +
            obj.repository.default_branch + "] Comment "+ obj.action +
            " on issue <a>#" + obj.issue.number +
            + " " + obj.issue.title +
            " by<a>" + obj.sender.login + "<a><br>" +
            obj.comment.body;


    obj2.message = mensaje;
    obj2.repoId = obj.repository.id;

    return obj2;


}


/*****************************************/



function getFieldsEvents (event, body) {

    var obj = {};
    var obj2 = {};
    message = "";

    obj.event = event;



    if(event == "issues" ){
        /* hay que mirar la accion
        * si es vacia return null
        * si no es opened, assigned, unassigned, closed, reopened */



        /* issues params:: para todos salvo assigned
         * action
         * issue: html_url/ title/ body/ number/ state
         *          milestone: number. title (puede ser vacio::
         *          mirarlo para la construccion del mensaje)
         * repository: id/ name/ default_branch
         * sender: login/ html_url
         * */

        /* issues assigned params: assignee */


        if(body.repository !== undefined && body.repository !== null){

            /* antes de parsear el repository hay que mirar action */
            if(body.action !== undefined && body.action !== null){
                if( body.action !== "assigned" ||
                    body.action !== "unassigned" ||
                    body.action !== "opened" ||
                    body.action !== "closed" ||
                    body.action !== "reopened" )
                {
                    return null;
                }/* no son las actions que queremos */


                else{

                    console.log("entro en 1");

                    obj.action = body.action;
                    obj.repository = getFieldsRepository(body.repository);


                    if(body.issue !== undefined && body.issue !== null){
                        /* si el action es assigned hay qye hacer mas cosas */

                        if(body.action == "assigned"){
                            obj.issue = getFieldsIssueAssigned(body.issue);

                        }
                        else{
                            obj.issue = getFieldsIssue(body.issue);

                        }




                    } /* end if existe issue */

                    if(body.sender !== undefined && body.sender !== null){
                        obj.sender = getFieldsSender(body.sender);


                    }/* end if hay sender */

                    /* tiene que ser lo devuelto !== de null
                     * sino tambien devolvemos null */

                    if( obj.repository !== null && obj.repository !== undefined &&
                        obj.action !== null && obj.action !== undefined &&
                        obj.issue !== null && obj.issue !== undefined &&
                        obj.sender !== null && obj.sender !== undefined ){

                        /* aqui llamamos a 1 metodo que nos cree el mensaje y
                            el id del repo y lo devolvemos */
                        /* si funciona sobra este metodo */
                        //obj2 = createResponseIssues(obj);
                        /* creo que es mejor convertir a string el json
                        * y guardarlo en la bd y luego en angular pasarlo
                        * ajson y trabajar con el */

                        message = JSON.stringify(obj);
                        obj2.message = message;
                        obj2.repositoryId = obj.repository.id;
                        return obj2;

                    }
                    else{
                        return null;
                    }


                }


            }




        } /* end if existe repository*/
        else{
            /* si no hay repositorio, es como si nada */
            return null;
        }



    } /* end if event == "issues"*/

    else if(event == "issue_comment"){

        /* issue_comment params::
         * action
         * issue: num/ title: esto cambiar , hay mas cosas recogiendose
         * comment: html_url/ body
         * nos hacemos otro metodo
         * repository: =
         * sender: =
         * */

        console.log("entro en 2");

        if(body.repository !== undefined && body.repository !== null){



            obj.repository = getFieldsRepository(body.repository);


            if(body.action !== undefined && body.action !== null){
                obj.action = body.action;

            }

            if(body.issue !== undefined && body.issue !== null){
                obj.issue = getFieldsIssueForComment(body.issue);

            }

            if(body.comment !== undefined && body.comment !== null){
                obj.comment = getFieldsCommentIssue(body.comment);

            }

            if(body.sender !== undefined && body.sender !== null){
                obj.sender = getFieldsSender(body.sender);


            }/* end if hay sender */

            /* tiene que ser lo devuelto !== de null
             * sino tambien devolvemos null */

            if( obj.repository !== null && obj.repository !== undefined &&
                obj.action !== null && obj.action !== undefined &&
                obj.issue !== null && obj.issue !== undefined &&
                obj.comment !== null && obj.comment !== undefined &&
                obj.sender !== null && obj.sender !== undefined){

                /* crear el mensaje y el id_repo */
                /*
                obj2 = createResponseCommentIssue(obj);
                */

                /* lo hace bien, lo convierte en string */
                console.log("convert JSON to String");
                var message3 = JSON.stringify(obj);
                console.log(message3);

                console.log("convert String to JSON");
                var message4= JSON.parse(message3);
                console.log(message4.repository.name);


                message = JSON.stringify(obj);
                obj2.message = message;
                obj2.repositoryId = obj.repository.id;
                return obj2;





            }
            else{
                return null;
            }


        } /* end if existe repository*/
        else{
            /* si no hay repositorio, es como si nada */
            return null;
        }


    }

    else if(event == "push"){
        console.log("entro en 3");

        /* push params::
         * ref: "refs/heads/changes" lo ultimo de da la rama:: es importante
         *
         * existe: commits [array] y head_commit {obj}, de momento head_commit,
         * aunque los merges no se como saldran
         * tambien se podría hacer 1 commits.lenght para saber cuantos se han hecho
         *
         * head_commit; id/ message / url/ author.username
         * repository: =
         * sender: = (mas que nada para la html_url, si este login = author.username
         * lo quito
         * */




        if(body.repository !== undefined && body.repository !== null){

            obj.repository = getFieldsRepositoryForPush(body.repository);


            if(body.ref !== undefined && body.ref !== null){
                /* aqui podríamos paresear, pero quiero mirar como sale */
                /*obj.ref = body.ref;*/
                var temp = body.ref.split("/");
                if(temp.length > 0){
                    obj.ref = temp[length-1];
                    console.log("esto vale la rama");
                    console.log(obj.ref);
                }


            }

            /** esto me sobraría hay que quitarlo
            if(body.head_commit !== undefined && body.head_commit !== null){
                obj.head_commit = getFieldsHeadCommit(body.head_commit);

            }
             **/

            if(body.commits !== undefined && body.commits !== null){
                if(body.commits.length > 0){

                    obj.commits = getFieldsCommitsArray(body.commits);


                }

            }




            if(body.sender !== undefined && body.sender !== null){
                obj.sender = getFieldsSender(body.sender);


            }/* end if hay sender */

            /* tiene que ser lo devuelto !== de null
             * sino tambien devolvemos null */

            if( obj.ref !== null && obj.ref !== undefined &&
                obj.commits !== null && obj.commits !== undefined &&
                obj.repository !== null && obj.repository !== undefined &&
                obj.sender !== null && obj.sender !== undefined ){

                /* hay que mirar si el array me lo parsea a string o
                * hay que hacerlo diferente */


                message = JSON.stringify(obj);
                obj2.message = message;
                obj2.repositoryId = obj.repository.id;
                return obj2;


            }
            else{
                return null;
            }


        } /* end if existe repository*/
        else{
            /* si no hay repositorio, es como si nada */
            return null;
        }


    }
    else if(event == "commit_comment"){


        /* push params::
         * action: created
         * comment; html_url/ id/ commit_id/ body
         * repository: =
         * sender: =
         * */

        console.log("entro en 4");


        if(body.repository !== undefined && body.repository !== null){

            /* de este si queremos default brach master */
            obj.repository = getFieldsRepository(body.repository);


            if(body.comment !== undefined && body.comment !== null){
                obj.comment = getFieldsCommentCommit(body.comment);

            }

            if(body.sender !== undefined && body.sender !== null){
                obj.sender = getFieldsSender(body.sender);


            }/* end if hay sender */

            /* tiene que ser lo devuelto !== de null
             * sino tambien devolvemos null */

            if( obj.comment !== null && obj.comment !== undefined &&
                obj.repository !== null && obj.repository !== undefined &&
                obj.sender !== null && obj.sender !== undefined ){


                message = JSON.stringify(obj);
                obj2.message = message;
                obj2.repositoryId = obj.repository.id;
                return obj2;

            }
            else{
                return null;
            }


        } /* end if existe repository*/
        else{
            /* si no hay repositorio, es como si nada */
            return null;
        }


    }
    else{

        /* si es 1 evento que no se quiere controlar devolvemos null */
        console.log("este evento no se quiere controlar");
        return null;
    }








}



module.exports = {

    getFieldsEvents: getFieldsEvents

};



//exports.checkgroupnameunique = function checkgroupnameunique(userid,groupname){

    /* check objects' fields of github POST */




    /* var User = mongoose.model('User');
    var promise = new Hope.Promise();
    User.findOne({ _id: userid}).populate('groups._group').exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else if (user){
            var encontrado = false;
            var i = 0;
            var listaGrupos = user.groups;
            while (encontrado === false && i<listaGrupos.length){
                if (listaGrupos[i]._group.groupName === groupname){
                    encontrado = true;
                }
                i++;
            }
            if (encontrado === true){
                var err = {
                    code   : 400,
                    message: 'The user already has a group with that name'
                };
                console.log("Error 401 - the user already has a group with that name");
                return promise.done(err, null);
            }else {
                return promise.done(null, user);
            }
        }
    }); */
   // return promise;
//};


