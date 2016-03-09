
module.exports = {
    'phrase': 'soynoderodecorazon', // frase para generar los tokens
    'expire': 4044000,
    'algorithm':'RS256',
    'salt_work_factor' : 5,
    //'database': 'mongodb://dessiuser:dessi2015@ds063134.mongolab.com:63134/dessi',
    'database': 'mongodb://127.0.0.1:27017/dessi',
    'port': 3200,
    'internalUserMail': 'internalUser@localhost',

    //embedly-api key
    'embedlyApiKey':'64367659fc864cd6adc74bb031611c68',

    // AWS - S3 config
    'bucketName': 'dessi',
    'accessKeyId': 'AKIAIVCRPQRMVVLT5PLQ',
    'secretAccessKey': '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',
    'region': 'eu-west-1'
};
