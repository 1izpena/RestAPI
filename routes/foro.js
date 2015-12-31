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

router.route('/question').post(question.newquestion);

router.route('/question/mostvoted').get(question.mostvoted);
router.route('/question/lastquestions').get(question.lastquestions);
router.route('/question/mostvisited').get(question.mostvisited);

module.exports = router;