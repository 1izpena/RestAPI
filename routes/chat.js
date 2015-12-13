var express = require('express');
var router = express.Router();
var group = require('../controllers/group');
var channel = require('../controllers/channel');

//Handler inicial para las rutas
router.use(function(req, res, next) {
// Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1/chat'+req.path);
    next(); // Pasa a la siguiente ruta
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.json({ message: 'Accediendo a /chat' });
});

/*  POST Crea y guarda un nuevo grupo, crea un canal publico por defecto, asocia el canal al grupo,
  asocia el grupo al usuario
*/
router.route('/group')
    .post(group.newgroup);


//POST Crea y guarda un nuevo canal, dentro del grupo con el groupid, actualiza referencias en grupo y usuario
router.route('/group/channel')
    .post(channel.newchannel);

module.exports = router;