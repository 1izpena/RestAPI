var express = require('express');

var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var User   = require('./models/user'); // Modelo user
var config = require('./config'); // archivo de configuración

//swagger - inicio
var argv = require('minimist')(process.argv.slice(2));
var swagger = require("swagger-node-express");
//swagger - fin
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
console.log("Conectando con base de datos...");
console.log("mongooseUri: " + mongooseUri);

var client = mongoose.connect(mongooseUri, options);


if (client){
    console.log("conexion con mongo ok. Client: " + client);
} else {
    console.log("error al conectar con mongo")
}


//mongoose.connect("mongodb://localhost/dessi");


//swagger - inicio
var subpath = express();
app.use("/v1", subpath);
swagger.setAppHandler(subpath);
app.use(express.static('dist'));
//app.use(express.static(path.join(__dirname, 'dist')));
//swagger - fin

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
   // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


    /* new PATH */
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, PATH, OPTIONS");
    /* new X-GitHub-OTP*/
    res.header("Access-Control-Allow-Headers", "Content-Type, x-access-token, Origin, X-Requested-With, Accept, X-GitHub-OTP, X-GitHub-Event, X-GitHub-Delivery, X-Hub-Signature");


    next();
});




// De momento no enviamos estaticos a los usuarios
//app.use(express.static(path.join(__dirname, 'public')));

/******* MODULOS DE LAS RUTAS *******/
// enrutador de usuarios
var users = require('./routes/users');
//enrutador de autorizacion
var authusers = require('./routes/authusers');
//enrutador para egstion de ficheros subidos a s3
var file = require('./routes/file');
//enrutador de foro
var forum = require('./routes/foro.js');
//Elastic
var elasticsearch = require('./routes/elasticsearch');




/*********** new **********/

var github = require('./routes/github');
var githubapi = require('./routes/githubapi');

    /*
var GithubWebHook = require('express-github-webhook');
var webhookHandler = GithubWebHook({ path: '/api/v1/callback', secret: config.CLIENT_SECRET });

*/

/******* RUTAS DEL API *******/
app.use('/api/v1/auth', authusers);
app.use('/api/v1/file', file);
app.use('/api/v1/users', users);
app.use('/api/v1/forum', forum);
app.use('/api/v1/', elasticsearch);


/************* new *****************/
app.use('/api/v1/callback', github);

app.use('/api/v1/githubapi', githubapi);




/* ahi que mirar donde poner las validaciones para crear el canal de github */
/* ahora en session y auth*/







//swagger - inicio
swagger.setApiInfo({
    title: "example API",
    description: "API to do something, manage something...",
    termsOfServiceUrl: "",
    contact: "yourname@something.com",
    license: "",
    licenseUrl: ""
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/dist/index.html');
});



// Set api-doc path
swagger.configureSwaggerPaths('', 'api-docs', '');

// Configure the API domain
var domain = config.domain;


//var domain = 'localhost';
//var domain = '192.168.0.15';
//var domain = '192.168.0.105';

if(argv.domain !== undefined)
    domain = argv.domain;
else{
    console.log('No --domain=xxx specified, taking default hostname "localhost".');
    console.log('Conect with domain:'+domain);
}

// Configure the API port
/*var port = 8080;
if(argv.port !== undefined)
    port = argv.port;
else
    console.log('No --port=xxx specified, taking default port ' + port + '.');*/

// Set and display the application URL
var applicationUrl = 'http://' + domain + ':' + port;
console.log('snapJob API running on ' + applicationUrl);

swagger.configure(applicationUrl, '1.0.0');
// Start the web server
//app.listen(port);
//swagger - fin

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
        console.error(err.stack);

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
