var express = require('express');
var router = express.Router();
var elasticsearch = require('../controllers/elasticsearch');





//Handler inicial para las rutas
router.use(function(req, res, next) {
    // Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1'+req.path);
    next(); // Pasa a la siguiente ruta
});


router.route('/forumsearch')
    .post(elasticsearch.forumsearch);


module.exports = router;
