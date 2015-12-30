var express = require('express');
var router = express.Router();
var session = require('../controllers/session');

//Handler inicial para las rutas
router.use(function(req, res, next) {
    // Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1/users'+req.path);
    next(); // Pasa a la siguiente ruta
});

/* GET users listing. */
router.get('/', function(req, res, next) {
     res.json({ message: 'Accediendo a los usuarios del sistema' });
});



/* GET users listing. */
router.get('/', function(req, res, next) {
     res.json({ message: 'Accediendo a los usuarios del sistema' });
});

/* GET selected user's public information */
router.route('/:userid')
    .get(session.publicprofile);

/* GET selected user's public information */
router.route('/:userid/profile')
    .get(session.publicprofile);

/* GET selected user's private information */
router.route('/:userid/privateprofile')
    .get(session.privateprofile);


module.exports = router;
