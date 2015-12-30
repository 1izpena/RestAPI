'use strict';

var aws = require('aws-sdk');
var config = require('../config');

exports.getSignedUrl = function getSignedUrl (request, response) {

    aws.config.update({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        signatureVersion: 'v4',
        region: config.region
    });

    var s3 = new aws.S3();
    var s3_params = {
        Bucket: config.bucketName,
        Key: request.body.filename,
        Expires: 60,
        ACL: 'public-read'
    };

    var url = s3.getSignedUrl('putObject', s3_params);

    response.json({url: url});

};


