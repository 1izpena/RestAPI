/**
 * Created by izaskun on 3/03/16.
 */

var config  = require('../config');
var http = require('http');
var Hope  = require('hope');

module.exports = function(result) {

/*
 + $.param({
 url: 'https://www.youtube.com/watch?v=jofNR_WkoCE',
 key: ":"+config.embedlyApiKey
 }),
 */

    var promise = new Hope.Promise();


    var options = {
        host: 'www.google.com',
        port: 80,
        path: '/index.html'
    };

    http.get(options, function(res) {
        console.log("Got response: " + res.statusCode);
        return promise.done(null,res);
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        return promise.done(error,null);
    });





/*

    var options = {
        host: 'https://www.google.es/',
        port: 80

    };

    http.get(options, function(req, res) {

        var url = 'https://www.youtube.com/watch?v=jofNR_WkoCE';
        var key = ':'+config.embedlyApiKey;


        res.send(url + ' ' + key );




        console.log("Got response: " + res.statusCode);
        console.log("*****thumnails*********");
        console.log(res);
        return promise.done(null, res);
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        return promise.done(error,null);
    });
/*
    var p = $.getJSON('https://api.embedly.com/1/oembed' + $.param({
            url: 'https://www.youtube.com/watch?v=jofNR_WkoCE',
            key: ":"+config.embedlyApiKey
        }));
    console.log(p);

    */


    // jQuery Embedly
   // $.embedly.oembed('https://www.youtube.com/watch?v=jofNR_WkoCE', {key: ":key"});


    /* return client.search({
        index: 'messages',
        body: {
            query: {
                query_string: {
                    query: "(content.title:"+request.body.key+
                    " OR content.text:"+request.body.key+
                        //" OR content.answers._user:"+request.body.key+
                    " OR content.answers.text:"+request.body.key+
                    " OR content.filename:"+request.body.key+
                        //" OR _user:"+request.body.key+
                    ") AND (_channel:"+request.params.channelid+")"
                }


            }

        }


    });*/



};
