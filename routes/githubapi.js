/**
 * Created by izaskun on 1/04/16.
 */



var express = require('express');
var router = express.Router();
var config = require('../config'); // archivo de configuración

/*
 var session = require('../controllers/session');
 */


var githubapi = require('../controllers/githubapi');



//Handler inicial para las rutas
router.use(function(req, res, next) {
// Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1/githubapi'+req.path);
    next(); // Pasa a la siguiente ruta
});



router.route('/')
    .get(githubapi.prueba1);



/* router.route('/').get(session.userlist);
 router.post('/', githubMiddleware, function(req, res) {
 // Only respond to github push events
 if (req.headers['x-github-event'] != 'push'){

 /* return res.status(200).end();*

 var payload = req.body
 , repo    = payload.repository.full_name;


 console.log("esto valebody");
 console.log(payload);
 return res.status(200).end();


 }
 else{
 var payload = req.body
 , repo    = payload.repository.full_name
 , branch  = payload.ref.split('/').pop();

 var textFiles = getChangedFiles(payload.commits, /.*\.txt$/);
 console.log("esto me devuelve el api");
 console.log(textFiles);

 }

 });


 // The Github push event returns an array of commits.
 // Each commit object has an array of added, modified and deleted files.
 // getChangedFiles() returns a list of all the added and modified files
 // excluding any files which are subsequently removed.
 function getChangedFiles(commits, matchRegex) {
 return commits
 .reduce(function(previousCommit, currentCommit) {
 return previousCommit
 .concat(currentCommit.modified)
 .concat(currentCommit.added)
 .filter(function(value) {
 return currentCommit.removed.indexOf(value) === -1;
 });
 }, [])
 .filter(function(value, i, arr) {
 return arr.indexOf(value) >= i && matchRegex.test(value);
 });
 }




 /*
 router.get('/', function(req, res, next) {
 res.json({ message: 'Accediendo a github' });
 });

 */

/*
 router.get('/', function(req, res) {
 var issueData = [];
 var getData = function(pageCounter) {
 request({
 url: 'https://api.github.com/repos/' + req.query.owner + '/' + req.query.repo + '/issues?state=all' + '&page=' + pageCounter + '&client_id=' + config.CLIENT_ID + '&' + 'client_secret=' + config.CLIENT_SECRET,
 headers: { 'user-agent': 'git-technetium' },
 json: true
 }, function(error, response, body) {
 if(!error && response.statusCode === 200) {
 for(var issueIndex = 0; issueIndex < body.length; issueIndex++) {
 if(!body[issueIndex].pull_request) {
 issueData.push({
 number: body[issueIndex].number,
 title: body[issueIndex].title,
 state: body[issueIndex].state,
 creator: body[issueIndex].user.login,
 assignee: body[issueIndex].assignee ? body[issueIndex].assignee.login : ''
 });
 }
 }

 if(body.length < 30) {
 res.send(issueData);
 } else {
 getData(pageCounter + 1);
 }
 }
 });
 };
 getData(1);
 });



 */




module.exports = router;