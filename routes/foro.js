var express = require('express');
var router = express.Router();
var question = require('../controllers/question');

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

/*GET Obtiene las preguntas ordenadas por votos de manera descendente*/
router.route('/question/mostvoted').get(question.mostvoted);

/*GET Obtiene las preguntas ordenadas por fecha */
router.route('/question/lastquestions').get(question.lastquestions);

/*GET Obtiene las preguntas ordenadas por visitas de manera descendente*/
router.route('/question/mostvisited').get(question.mostvisited);

/*POST Votar positivo a la pregunta*/
router.route('/question/:questionid/upvote').post(question.upvote);

/*POST Votar negativo a la pregunta*/
router.route('/question/:questionid/downvote').post(question.downvote);

/*POST Comentar una pregunta*/
router.route('/question/:questionid/comment').post(question.commentquestion);

module.exports = router;