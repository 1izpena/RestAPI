var express = require('express');
var router = express.Router();
var session = require('../controllers/session');

//Handler inicial para las rutas
router.use(function(req, res, next) {
    // Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1/auth'+req.path);
    next(); // Pasa a la siguiente ruta
});

/* GET users listing. */
/* probar servidor */
router.get('/', function(req, res, next) {
     res.json({ message: 'Accediendo a loggearse' });
});


router.route('/signup')
    .post(session.signup);

router.route('/login')
    .post(session.login);

router.route('/forget')
    .post(session.forget);

router.route('/reset')
	.post(session.reset);
	
router.route('/activate')
	.post(session.activate);

router.route('/remove')
    .post(session.remove);

router.route('/social')
    .post(session.social);


/******** new *********/
/*
router.route('/pruebaGithub')
    .get(session.pruebaGithub2);

    */

/* igual cambiar el controller */
router.route('/pruebaGithub')
    .get(session.pruebaGithub3);

module.exports = router;
