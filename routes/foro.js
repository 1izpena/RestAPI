var express = require('express');
var router = express.Router();
var question = require('../controllers/question');
var answer = require('../controllers/answer');
var tag = require('../controllers/tag');

//Handler inicial para las rutas
router.use(function(req, res, next) {
// Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1/forum'+req.path);
    next(); // Pasa a la siguiente ruta
});

router.get('/', function(req, res, next) {
     res.json({ message: 'Accediendo a foro' });
});







/*POST Crea una pregunta nueva*/
router.route('/question').post(question.newquestion);

/*Get Obtiene todas las preguntas*/
router.route('/questions').get(question.getquestions);

/*GET Obtiene la pregunta por identificador*/
router.route('/question/:questionid').get(question.getquestionbyid);

/*PUT Votar positivo a la pregunta*/
router.route('/question/:questionid/upvote').put(question.upvote);

/*PUT Votar negativo a la pregunta*/
router.route('/question/:questionid/downvote').put(question.downvote);

/*PUT Comentar una pregunta*/
router.route('/question/:questionid/comment').put(question.commentquestion);

/*DELETE Eliminar una pregunta*/
router.route('/question/:questionid/delete').delete(question.deletequestion);

/*PUT Editar una pregunta*/
router.route('/question/:questionid/edit').put(question.editquestion);


/*POST Nueva respuesta a una pregunta por id*/
router.route('/question/:questionid/answer').post(answer.newanswer);

/*PUT comentar la respuesta*/
router.route('/question/:questionid/answer/:answerid/comment').put(answer.commentanswer);

/*Put votar positivo la respuesta*/
router.route('/question/:questionid/answer/:answerid/upvote').put(answer.upvote);

/*Put votar negativo la respuesta*/
router.route('/question/:questionid/answer/:answerid/downvote').put(answer.downvote);

/*Delete eliminar respuesta*/
router.route('/question/:questionid/answer/:answerid/delete').delete(answer.deleteanswer);

/*Put editar respuesta*/
router.route('/question/:questionid/answer/:answerid/edit').put(answer.editanswer);


/*Get obtener los tags*/
router.route('/tags').get(tag.gettags);

/*GET obtener todas las preguntas por tag*/
router.route('/tag/:tagid').get(tag.getQuestionsByTag);


module.exports = router;