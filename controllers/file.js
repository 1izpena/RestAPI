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
            else {
                var filename = 'GR'+data.groupid+'/CH'+data.channelid+'/'+data.filename;
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
                    Expires: 60,
                    ACL: 'public-read'
                };

                var url = s3.getSignedUrl('putObject', s3_params);

                response.json({url: url});
            }
        }
    });
};


