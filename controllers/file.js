'use strict';

var aws = require('aws-sdk');
var config = require('../config');
var Auth  = require('../helpers/authentication');


exports.getSignedUrl = function getSignedUrl (request, response) {

    Auth(request, response).then(function(error, result) {
        if (error) {
            response.status(error.code).json({message: error.message});
        }
        else {
            var data = request.body;
            if (!data.filename) {
                response.status(400).json({message: "filename required"});
            }
            else if (!data.groupid) {
                response.status(400).json({message: "groupid required"});
            }
            else if (!data.channelid) {
                response.status(400).json({message: "channelid required"});
            }
            else if (!data.operation) {
                response.status(400).json({message: "operation required"});
            }
            else {
                var filename = 'GR'+data.groupid+'/CH'+data.channelid+'/'+data.filename;
                console.log("Filename: "+filename);
                aws.config.update({
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey,
                    signatureVersion: 'v4',
                    region: config.region
                });

                var s3 = new aws.S3();
                var s3_params = {
                    Bucket: config.bucketName,
                    Key: filename,
                    Expires: 60
                };

                var op;
                if (data.operation == 'PUT') {
                    op = 'putObject';
                }
                else {
                    op = 'getObject';
                    s3_params.ResponseContentDisposition = 'attachment';
                }
                var url = s3.getSignedUrl(op, s3_params);

                console.log ("URL: "+url);

                response.json({url: url});
            }
        }
    });
};


