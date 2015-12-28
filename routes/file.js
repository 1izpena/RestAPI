var express = require('express');
var router = express.Router();
var file = require('../controllers/file.js');

//Handler inicial para las rutas
router.use(function(req, res, next) {
    // Aqui podemos poner lo que queramos para tratar las rutas inicialmente
    console.log('accediendo a la ruta /api/v1/file'+req.path);
    next(); // Pasa a la siguiente ruta
});

router.route('/getSignedUrl')
    .post(file.getSignedUrl);

module.exports = router;
