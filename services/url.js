/**
 * Created by izaskun on 9/03/16.
 */


var Hope  = require('hope');
var oembed = require('oembed-auto');
var MetaInspector = require('node-metainspector');



exports.getMetaTags = function getMetaTags (url) {

    var promise = new Hope.Promise();

    var client = new MetaInspector(url, { timeout: 5000 });

    console.log("esto vale la url del servicio url");

    oembed(url, function(error, result) {

        if (error){
            console.log("entro en error");
            console.log(error);

            client.fetch();
        }

        else{
            console.log("entro en NO error");
            console.log(result);


            /* si la result es de tipo link, hacemos con la otra librería */
            if(result.type == 'link' || typeof (result.type) == 'undefined'){
                client.fetch();
            }
            else {
                console.log("esto vale oembed: video,audio, rich..");
                console.log(result);
                /*res.json(result);*/
                //return result;
                return promise.done(null, result);

            }


        }

    });


    client.on("fetch", function(){

        var metatags = {
            host: client.host,
            title: client.title,
            description: client.description,
            author: client.author,
            keywords: client.keywords,
            image: client.image
        };


        //res.json(metatags);
        //return result;
        return promise.done(null, metatags);


    });

    client.on("error", function(err){
        console.log(err);
        /*res.status(404).json({message: err.message});*/
        //return err;
        return promise.done(err, null);
    });

    return promise;


};