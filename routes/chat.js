var express = require('express');
var router = express.Router();
var group = require('../controllers/group');
var channel = require('../controllers/channel');
var message = require('../controllers/message');

//Handler inicial para las rutas
router.use(function(req, res, next) {
// Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1/users/:userid/chat'+req.path);
    next(); // Pasa a la siguiente ruta
});

/* GET Devuelve lista de grupos del usuario */
router.route('/').get(group.getuserchatinfo);

/* GET Devuelve lista de invitaciones que tenga pendientes de aceptar o rechazar el usuario */
router.route('/invitations').get(group.getinvitationslist);

/* POST Acepta la invitación  */
router.route('/invitations/:groupid').post(group.acceptinvitation);

/* DELETE Rechaza la invitación  */
router.route('/invitations/:groupid').delete(group.regretinvitation);

/* GET Devuelve lista de grupos del usuario */
router.route('/groups').get(group.getusergrouplist);

/* POST Crea y guarda un nuevo grupo, crea un canal publico por defecto, asocia el canal al grupo,asocia el grupo al usuario */
router.route('/groups').post(group.newgroup);

/* GET Devuelve la información del grupo seleccionado */
router.route('/groups/:groupid').get(group.getgroupinfo);

/* DELETE el usuario logeado se va del grupo */
router.route('/groups/:groupid/unsuscribe').delete(group.unsuscribefromgroup);

/* GET Devuelve la lista de usuarios del grupo */
router.route('/groups/:groupid/users').get(group.getgroupuserlist);

/* DELETE elimina el usuario :userid al grupo */
router.route('/groups/:groupid/users/:userid').delete(group.deleteuserfromgroup);

/* POST Añade el usuario :userid al grupo */
router.route('/groups/:groupid/users/:userid').post(group.addusertogroup);

/* POST invita al usuario :userid al grupo */
router.route('/groups/:groupid/users/:userid/invite').post(group.inviteusertogroup);

/* POST Crea y guarda un nuevo canal, dentro del grupo con el groupid, actualiza referencias en grupo y usuario */
router.route('/groups/:groupid/channels').post(channel.newchannel);

/* GET Devuelve la lista de canales que tenga el usuario en ese grupo */
router.route('/groups/:groupid/channels').get(channel.getgroupchannellist);

/* GET Devuelve la lista de usuarios del canal */
router.route('/groups/:groupid/channels/:channelid/users').get(channel.getchanneluserlist);

/* POST el usuario logeado añade al usuario :userid al canal */
router.route('/groups/:groupid/channels/:channelid/users/:userid').post(channel.addusertochannel);

/* DELETE el usuario logeado elimina al usuario :userid del canal */
router.route('/groups/:groupid/channels/:channelid/users/:userid').delete(channel.deleteuserfromchannel);

/* DELETE el usuario logeado se va del canal */
router.route('/groups/:groupid/channels/:channelid/unsuscribe').delete(channel.unsuscribefromchannel);

router.route('/channels/:channelid/messages').post(message.newmessage);

module.exports = router;
