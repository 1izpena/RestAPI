var express = require('express');

var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var app = express();

var User   = require('./models/user'); // Modelo user
var config = require('./config'); // archivo de configuración





//MongoDB
var mongoose = require("mongoose");
var uriUtil = require('mongodb-uri');

//mongoose.connect("mongodb://dessiuser:dessi2015@ds063134.mongolab.com:63134/dessi");



var port = process.env.PORT || config.port; //3200
app.set('superSecret', config.phrase); // setear frase secreta

/* mongoconfig */
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };  

var mongooseUri = uriUtil.formatMongoose(config.database);
mongoose.connect(mongooseUri, options);








// view engine setup: Solo para errores
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//Handler para peticiones de otros dominios
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// De momento no enviamos estaticos a los usuarios
//app.use(express.static(path.join(__dirname, 'public')));

/******* MODULOS DE LAS RUTAS *******/
// enrutador de usuarios 
var users = require('./routes/users');
//enrutador de autorizacion
var authusers = require('./routes/authusers');

/******* RUTAS DEL API *******/

app.use('/api/v1/users', users);
app.use('/api/v1/auth', authusers);

// Si no encuentra la ruta, envia un 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


/***** ERROR HANDLERS *****/

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
        message: err.message,
        error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
