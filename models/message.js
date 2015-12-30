var mongoose    = require('mongoose');
var Hope      	= require('hope');
var Channel  = require('./channel');
var User  = require('./user');

var Schema = mongoose.Schema;

var messageSchema   = new Schema({
    _channel: { type: Schema.ObjectId, ref: 'Channel', required: true },
    _user : { type: Schema.ObjectId, ref: 'user', required: true },
    datetime: { type: Date, required: true },
    messageType: { type: String, required: true },
    content: {
        text: String,
        path: String,
        question: { text: String,
                    answers: [ { text: String }]
        }

    }
});

messageSchema.path('messageType').validate(function(messageType){
    var validTypes = ['FILE', 'TEXT', 'QUESTION'];
    var strValidTypes = "";

    var numTypes = validTypes.length
    for (var i = 0; i < numTypes; i++) {
        if (strValidTypes !== "")
            strValidTypes+=", ";
        strValidTypes+=validTypes[i];
        if (messageType === validTypes[i]) {
            return true;
        }
    }
    return false;
}, 'Not valid Value for messageType' );


messageSchema.statics.newMessage = function (data) {
    var promise = new Hope.Promise();

    Channel.search({_id: data.channelid}, limit = 1).then(function(error, channel) {

        if (error || (channel === null)) {
            error = { code: 400, message: 'Channel not found.' };
            return promise.done(error, null);
        }

        var Message = mongoose.model('Message', messageSchema);
        data._channel = data.channelid;
        data._user = data.userid;
        data.datetime = new Date();

        if (data.messageType === 'FILE') {
            data.content = { path: data.filename}
        }
        else if (data.messageType === 'TEXT') {
            data.content = { text: data.text}
        }

        Message = new Message(data);
        Message.save(function (error, message) {
            if(error){
                var messageError = '';
                for (err in error.errors) {
                    if (messageError !== '')
                        messageError += '.';
                    messageError += error.errors[err].message;
                }

                error = { code: 400, message: messageError };
                return promise.done(error, null);
            }
            else {
                return promise.done(error, message);
            }
        });



    });
    return promise;
};

/* BUSCAR */
messageSchema.statics.search = function search (query, limit) {
    var promise = new Hope.Promise();

    this.find(query).limit(limit).exec(function(error, value) {
        if (limit === 1 && !error) {
            if (value.length === 0) {
                error = {
                    code: 402,
                    message: "Not found."
                };
            }
            value = value[0];
        }

        return promise.done(error, value);
    });
    return promise;
};

module.exports = mongoose.model('message', messageSchema);


