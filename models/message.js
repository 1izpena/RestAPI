var mongoose    = require('mongoose');
var Hope      	= require('hope');
var Channel  = require('./channel');
var User  = require('./user');

var Schema = mongoose.Schema;

var messageSchema   = new Schema({
    _channel: { type: Schema.ObjectId, ref: 'Channel', required: true },
    _user : { type: Schema.ObjectId, ref: 'User', required: true },
    datetime: { type: Date, required: true },
    messageType: { type: String, required: true },
    content: {
        text: String,
        answers: [{ text: String }]
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

        data._channel = data.channelid;
        data._user = data.userid;
        data.datetime = new Date();

        if (data.messageType === 'FILE') {
            data.content = { text: data.filename}
        }
        else if (data.messageType === 'TEXT') {
            data.content = { text: data.text}
        }

        var Message = mongoose.model('Message', messageSchema);
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

                message
                    .populate( { path: '_channel _user'} , function(err, message) {
                        if (err) {
                            return promise.done(error, message.parse());
                        }
                        else {
                            return promise.done(error, message.parsePopulated());
                        }
                    });


                //return promise.done(error, message.parse());
            }
        });



    });
    return promise;
};

messageSchema.statics.getMessages = function (data) {
    var promise = new Hope.Promise();

    Channel.search({_id: data.channelid}, limit = 1).then(function(error, channel) {

        if (error || (channel === null)) {
            error = { code: 400, message: 'Channel not found.' };
            return promise.done(error, null);
        }

        data._channel = data.channelid;
        data._user = data.userid;
        data.datetime = new Date();

        if (data.messageType === 'FILE') {
            data.content = { text: data.filename}
        }
        else if (data.messageType === 'TEXT') {
            data.content = { text: data.text}
        }

        var Message = mongoose.model('Message', messageSchema);
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

                message
                    /*
                     .populate( { path: '_channel', select: '_id channelName' })
                     .populate( { path: '_user', select: '_id username' })
                     .execPopulate(function(err, message) {
                     */
                    .populate( { path: '_channel _user'} , function(err, message) {
                        if (err) {
                            return promise.done(error, message.parse());
                        }
                        else {
                            return promise.done(error, message.parsePopulated());
                        }
                    });


                //return promise.done(error, message.parse());
            }
        });



    });
    return promise;
};

/* BUSCAR */
messageSchema.statics.search = function search (query, limit, page) {
    var promise = new Hope.Promise();
    var parseValue = [];

    if(!page) {
        page = 0;
    }

    if(!limit) {
        limit = 0;
    }

    this.find(query).skip(skip).limit(limit).populate('_channel _user').exec(function(error, value) {
        if (error) {
            return promise.done(error, null);
        }
        else if (limit === 1) {
            if (value.length === 0) {
                error = {
                    code: 402,
                    message: "Message not found."
                };
            }
            value = value[0];
        }
        else {
            value.map(function(elem,index) {
                return elem.parsePopulated();
            })
        }

        return promise.done(error, value);
    });
    return promise;
};


messageSchema.methods.parse = function parse () {
    var message = this;

    var parseMessage = {
        id          : message._id,
        channel: {
            id         : message._channel,
            channelName: ''
        },
        user: {
            id         : message._user,
            username:  ''
        },
        date        : message.datetime,
        messageType : message.messageType,
        text        : message.text

    };

    if (message.messageType == 'QUESTION') {
        parseMessage.answers = message.answers;
    }

    return parseMessage;
};

messageSchema.methods.parsePopulated = function parsePopulated () {
    var message = this;

    var parseMessage = message.parse();

    parseMessage.channel.id = message._channel._id;
    parseMessage.channel.channelName = message._channel.channelName;

    parseMessage.user.id = message._user._id;
    parseMessage.user.username = message._user.username;

    return parseMessage;
};

module.exports = mongoose.model('Message', messageSchema);




