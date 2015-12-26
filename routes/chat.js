var express = require('express');
var router = express.Router();
var group = require('../controllers/group');
var channel = require('../controllers/channel');

//Handler inicial para las rutas
router.use(function(req, res, next) {
// Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1/users/:username/chat'+req.path);
    next(); // Pasa a la siguiente ruta
});

/* GET Devuelve lista de grupos del usuario */
router.route('/').get(group.getuserchatinfo);

/* GET Devuelve lista de grupos del usuario */
router.route('/groups').get(group.getusergrouplist);

/* POST Crea y guarda un nuevo grupo, crea un canal publico por defecto, asocia el canal al grupo,asocia el grupo al usuario */
router.route('/groups').post(group.newgroup);

/* GET Devuelve la información del grupo seleccionado */
router.route('/groups/:groupid').get(group.getgroupinfo);

/* POST Crea y guarda un nuevo canal, dentro del grupo con el groupid, actualiza referencias en grupo y usuario */
router.route('/groups/:groupid/channels').post(channel.newchannel);

/* GET Devuelve la lista de usuarios del grupo */
router.route('/groups/:groupid/users').get(group.getgroupuserlist);

module.exports = router;
