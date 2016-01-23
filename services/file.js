var aws = require('aws-sdk');
var config = require('../config');
var Hope  = require('hope');


/***********************************************************************+
 Get signed url to make a operation with a bucket in AWS S3

 Input parameters in input data object:
      filename  name without path
      groupid
      channelid
      userid
      operation  GET, PUT (create if not exists), DELETE

  Return:   URL
 ***********************************************************************+*/

exports.getSignedUrl = function getSignedUrl (data) {

    var filename = 'GR'+data.groupid+'/CH'+data.channelid+'/USR'+data.userid+'/'+data.filename;
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
    else if (data.operation == 'DELETE'){
        op = 'deleteObject';
    }
    else {
        op = 'getObject';
        s3_params.ResponseContentDisposition = 'attachment';
    }
    var url = s3.getSignedUrl(op, s3_params);

    return url;

};

/************************************************************************+
 Delete ONE file in AWS S3 Bucket
     Input parameters in input data object:
         filename  --> name without path
         groupid
         channelid
         userid
     Return:    promise
 ************************************************************************/
exports.deleteFile = function deleteFile (data) {

    var promise = new Hope.Promise();

    var filename = 'GR'+data.groupid+'/CH'+data.channelid+'/USR'+data.userid+'/'+data.filename;
    aws.config.update({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        signatureVersion: 'v4',
        region: config.region
    });

    var s3 = new aws.S3();
    var s3_params = {
        Bucket: config.bucketName,
        Key: filename
    };

    s3.deleteObject(s3_params, function (error, data) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, data);
        }
    });

    return promise;
};

/************************************************************************
 Delete ALL files in a group folder  in AWS S3 Bucket
     Input parameters in input data object:
         groupid
     Return:    promise
 ************************************************************************/
exports.deleteGroupFolder = function deleteGroupFolder (data) {

    var foldername = 'GR' + data.groupid;

    return deleteFolder(foldername);

};

/*************************************************************************
 Delete ALL files in a channel folder  in AWS S3 Bucket
     Input parameters in input data object:
         groupid
         channelid
     Return:    promise
 *************************************************************************/
exports.deleteChannelFolder = function deleteChannelFolder (data) {

    var foldername = 'GR' + data.groupid + '/CH' + data.channelid;

    deleteFolder(foldername);
};

/*************************************************************************
 Delete a folder (and all files included) in AWS S3 Bucket
     Input parameters:
         folfername
     Return:    promise
 *************************************************************************/
function deleteFolder (foldername) {

    var promise = new Hope.Promise();

    aws.config.update({
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        signatureVersion: 'v4',
        region: config.region
    });

    var s3 = new aws.S3();
    var s3ListParams = {
        Bucket: config.bucketName,
        Prefix : foldername
    };

    s3.listObjects(s3ListParams, function (error, listData) {
        if (error) {
            console.log("Error in s3.listObjects");
            console.log(error);
            return promise.done(error, null);
        }
        else if (listData.Contents.length == 0) {
            return promise.done(null, {result: 'ok'});
        }
        else {
            var s3DeleteParams = {
                Bucket: config.bucketName,
                Delete: {
                    Objects: []
                }
            };

            listData.Contents.forEach(function (content) {
                s3DeleteParams.Delete.Objects.push({Key: content.Key});
            });

            s3.deleteObjects(s3DeleteParams, function (error, deleteData) {
                if (error) {
                    console.log("Error in s3.deleteObjects");
                    console.log(error);
                    return promise.done(error, null);
                }
                else {
                    // Check if are more contents in folder
                    if (listData.IsTruncated) {
                        return deleteFolder (foldername)
                    }
                    else {
                        return promise.done(null, {result: 'ok'});
                    }
                }
            });
        }
    });



    return promise;
};