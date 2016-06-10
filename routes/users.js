var express = require('express');
var router = express.Router();
var session = require('../controllers/session');
var group = require('../controllers/group');
var channel = require('../controllers/channel');
var message = require('../controllers/message');
var elasticsearch = require('../controllers/elasticsearch');

var githubapi = require('../controllers/githubapi');
var userstory = require('../controllers/userstory');

var task = require('../controllers/task');

var sprint = require('../controllers/sprint');
var issue = require('../controllers/issue');





//Handler inicial para las rutas
router.use(function(req, res, next) {
    // Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1/users'+req.path);

    next(); // Pasa a la siguiente ruta
});




/* GET users listing. */
/* http://localhost:3000/api/v1/users?limit=6&page=2 */

router.route('/').get(session.userlist);

/* GET selected user's public information */
router.route('/:userid').get(session.publicprofile);

/* GET selected user's public information */
router.route('/:userid/profile').get(session.publicprofile);

/* GET selected user's private information */
router.route('/:userid/privateprofile').get(session.privateprofile);


/* POST metatags of url which user sends */
router.route('/:userid/get_meta').post(session.userplaylist);


/*************** new ****************/
/* GET return Github accounts of userid */
router.route('/:userid/github/accounts').get(githubapi.getAccountsGithub);


/* POST Create a new application authorization */
/* params : userid, username, pass (githubaccount)
*  return githubtoken + repositories without webhooks
* */
router.route('/:userid/github/auth').post(githubapi.auth);

/* esto igual debería ir en canal
 * para hacer validaciones y mandar ala bd, de momento usuario
 * luego grupo/channels*/
/* puedo hacer dos peticiones desde angular, esta y una para crear el canal, cuando tenga la respuesta */


router.route('/:userid/github/createHooks').post(githubapi.createHooks);





/* GET Devuelve lista de grupos del usuario */
router.route('/:userid/chat').get(group.getuserchatinfo);

/* GET Devuelve lista de invitaciones que tenga pendientes de aceptar o rechazar el usuario */
router.route('/:userid/chat/invitations').get(group.getinvitationslist);

/* POST Acepta la invitación  */
router.route('/:userid/chat/invitations/:groupid').post(group.acceptinvitation);

/* DELETE Rechaza la invitación  */
router.route('/:userid/chat/invitations/:groupid').delete(group.regretinvitation);

/* GET Devuelve lista de grupos del usuario */
router.route('/:userid/chat/groups').get(group.getusergrouplist);

/* POST Crea y guarda un nuevo grupo, crea un canal publico por defecto, asocia el canal al grupo,asocia el grupo al usuario */
router.route('/:userid/chat/groups').post(group.newgroup);

/* GET Devuelve la información del grupo seleccionado */
router.route('/:userid/chat/groups/:groupid').get(group.getgroupinfo);

/* DELETE El usuario logeado, si es el administrador del grupo, elimina el grupo del sistema */
router.route('/:userid/chat/groups/:groupid').delete(group.deletegroupfromsystem);

/* PUT El usuario logeado, si es el administrador del grupo, modifica el nombre del grupo */
router.route('/:userid/chat/groups/:groupid').put(group.updategroupinfo);

/* DELETE el usuario logeado se va del grupo */
router.route('/:userid/chat/groups/:groupid/unsuscribe').delete(group.unsuscribefromgroup);

/* GET Devuelve la información del grupo seleccionado */
router.route('/:userid/chat/groups/:groupid/invitedUsers').get(group.getusersinvited);

/* GET Devuelve la lista de usuarios del grupo */
router.route('/:userid/chat/groups/:groupid/users').get(group.getgroupuserlist);

/* DELETE elimina el usuario :userid al grupo */
router.route('/:userid/chat/groups/:groupid/users/:userid1').delete(group.deleteuserfromgroup);

/* POST invita al usuario :userid al grupo */
router.route('/:userid/chat/groups/:groupid/users/:userid1/invite').post(group.inviteusertogroup);

/* POST Crea y guarda un nuevo canal, dentro del grupo con el groupid, actualiza referencias en grupo y usuario */
router.route('/:userid/chat/groups/:groupid/channels').post(channel.newchannel);

/* por aqui deberia entrar el de create webhooks */



/************************************************/
/* GET Devuelve la lista de canales que tenga el usuario en ese grupo */
router.route('/:userid/chat/groups/:groupid/channels').get(channel.getgroupchannellist);


/* POST Devuelve la lista de mensajes del canal que coinciden con el contenido de la búsqueda*/
router.route('/:userid/chat/groups/:groupid/channels/:channelid/search').post(elasticsearch.chatsearch);


/* ********************* scrum ************************* */

/* GET CH USERSTORIES  */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/userstories').get(userstory.getuserstories);
/* POST CH USERSTORIES  */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/userstories').post(userstory.newuserstory);
/* PUT CH USERSTORIES  */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/userstories/:userstoryid').put(userstory.updateuserstory);
/* DELETE CH USERSTORIES  */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/userstories/:userstoryid').delete(userstory.deleteuserstories);





/* POST CH TASK  */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/userstories/:userstoryid/tasks').post(task.newtask);
/* PUT CH TASK  */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/userstories/:userstoryid/tasks/:taskid').put(task.updatetask);
/* DELETE CH TASK  */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/userstories/:userstoryid/tasks/:taskid').delete(task.deletetask);





/* GET CH SPRINTS  */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/sprints').get(sprint.getsprints);
/* GET CH ISSUES  */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/issues').get(issue.getissues);






/* GET Devuelve la lista de usuarios del canal */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/users').get(channel.getchanneluserlist);

/* POST el usuario logeado añade al usuario :userid al canal */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/users/:userid1').post(channel.addusertochannel);

/* DELETE el usuario logeado elimina al usuario :userid del canal */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/users/:userid1').delete(channel.deleteuserfromchannel);

/* DELETE el usuario logeado se va del canal */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/unsuscribe').delete(channel.unsuscribefromchannel);

/* GET Devuelve la info del canal */
router.route('/:userid/chat/groups/:groupid/channels/:channelid').get(channel.getchannelinfo);

/* DELETE el usuario logeado elimina el canal del grupo */
router.route('/:userid/chat/groups/:groupid/channels/:channelid').delete(channel.deletechannelfromgroup);

/* PUT El usuario logeado, modifica el nombre del canal */
router.route('/:userid/chat/groups/:groupid/channels/:channelid').put(channel.updatechannelinfo);

/* POST crea un nuevo mensaje dentro del canal :channelid */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/messages').post(message.newmessage);
/* GET devuelve los mensajes del canal :channelid */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/messages').get(message.getmessages);
/* DELETE elimina todos los mensajes del canal :channelid */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/messages').delete(message.deletechannelmessagges);
/* POST crea una nueva respuesta para un mensaje de tipo question */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/messages/:messageid/answer').post(message.newanswer);

/* POST crea una nueva respuesta para un mensaje de tipo question */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/messages/:messageid/publish').post(message.publishQuestion);

/* GET devuelve los ficheros del grupo a los que puede acceder el usuario */
router.route('/:userid/chat/groups/:groupid/files').get(message.getfiles);

/* DELETE elimina el mensaje :messageid dentro del canal :channelid */
router.route('/:userid/chat/groups/:groupid/channels/:channelid/messages/:messageid').delete(message.deletechannelmessagge);

/* GET devuelve la lista de usuarios del canal :channelid */
router.route('/:userid/chat/channels/:channelid/users').get(channel.getchanneluserlist);

/* GET devuelve la lista de usuarios del canal :channelid */
router.route('/:userid/chat/channels/:channelid').get(channel.getchannelinfo);

/* PUT El usuario logeado, modifica el nombre del canal */
router.route('/:userid/chat/channels/:channelid').put(channel.updatechannelinfo);

/* DELETE el usuario logeado se va del canal */
router.route('/:userid/chat/channels/:channelid/unsuscribe').delete(channel.unsuscribefromchannel);

module.exports = router;