var mongoose    = require('mongoose');
var mongoosastic = require('mongoosastic');
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
        title: String,
        text: String,
        filename: String,
        answers: [{
            _user: {type: Schema.ObjectId, ref: 'User'},
            datetime: { type: Date, required: true },
            text: String }]
    }
});

messageSchema.plugin(mongoosastic);

messageSchema.path('messageType').validate(function(messageType){
    var validTypes = ['FILE', 'TEXT', 'QUESTION'];
    var strValidTypes = "";

    var numTypes = validTypes.length;
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
            if (!data.filename) {
                error = { code: 400, message: 'filename required.' };
                return promise.done(error, null);
            }
            data.content = { filename: data.filename};
            if (data.comment) {
                data.content.text = data.comment;
            }
        }
        else if (data.messageType === 'TEXT') {
            if (!data.text) {
                error = { code: 400, message: 'text required.' };
                return promise.done(error, null);
            }
            data.content = { text: data.text}
        }
        else if (data.messageType === 'QUESTION') {
            if (!data.title) {
                error = { code: 400, message: 'title required.' };
                return promise.done(error, null);
            }
            if (!data.text) {
                error = { code: 400, message: 'text required.' };
                return promise.done(error, null);
            }
            data.content = { title: data.title, text: data.text}
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
                message.populate( { path: '_channel _user content.answers._user'} , function(err, message) {
                        return promise.done(error, message.parse());
                });
            }
        });



    });
    return promise;
};

messageSchema.statics.getMessages = function (data) {
    var promise = new Hope.Promise();

    if (!data.channelid) {
        error = { code: 400, message: 'channelid required.' };
        return promise.done(error, null);
    }

    Channel.search({_id: data.channelid}, limit = 1).then(function(error, channel) {

        if (error || (channel === null)) {
            error = { code: 400, message: 'Channel not found.' };
            return promise.done(error, null);
        }

        var query = { _channel: data.channelid };
        var Message = mongoose.model('Message', messageSchema);
        Message.search(query, data.limit, data.page).then(function (error, result) {
            if (error) {
                return promise.done(error, null);
            }
            else {
                return promise.done(null, result);
            }
        });

    });
    return promise;
};

messageSchema.statics.newAnswer = function (data) {
    var promise = new Hope.Promise();

    var Message = mongoose.model('Message', messageSchema);
    Message.search({_id: data.messageid}, limit = 1).then(function(error, message) {

        if (error || (message === null)) {
            error = { code: 400, message: 'Message not found.' };
            return promise.done(error, null);
        }
        if (message.messageType != 'QUESTION') {
            error = { code: 400, message: 'Message not a question' };
            return promise.done(error, null);
        }

        var answer = {
            _user: data.userid,
            datetime: new Date(),
            text: data.text
        };

        message.content.answers.push(answer);
        message.save(function (error, message) {
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

                message.populate( { path: 'content.answers._user'} , function(err, message) {

                    message = message.parse();

                    // Buscamos la ultima respuesta para devolver solo la respuesta creada
                    var iLast = message.answers.length - 1;
                    var retObject = {
                        id: message.id,
                        answer: message.answers[iLast]
                    };
                    return promise.done(null, retObject);
                });
            }
        });


    });

    return promise;
};

messageSchema.statics.getFiles = function (data) {
    var promise = new Hope.Promise();

    var query = { $and: [ { _channel: { $in: data.channelsList } }, { messageType: 'FILE' } ] };
    var Message = mongoose.model('Message', messageSchema);
    Message.search(query, data.limit, data.page).then(function (error, result) {
        if (error) {
            return promise.done(error, null);
        }
        else {
            return promise.done(null, result);
        }
    });

    return promise;
};

/* BUSCAR */
messageSchema.statics.search = function search (query, limit, page) {
    var promise = new Hope.Promise();

    if(!page) {
        page = 0;
    }
    if(!limit) {
        limit = 0;
    }
    var skip = (page * limit);

    this.find(query).sort({datetime: -1})
        .skip(skip).limit(limit)
        .populate('_channel _user content.answers._user')
        .exec(function(error, value) {
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
                value=value.map(function(elem,index) {
                    return elem.parse();
                });
                // Ordenamos x orden descendente de fecha
                value=value.reverse();
            }
            // Devolvemos en order ascendente de fecha
            return promise.done(error, value);
    });
    return promise;
};

/* ELIMINAR */
messageSchema.statics.deletemessage = function deletemessage (id) {
    var promise = new Hope.Promise();
    this.remove({_id:id},function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("message deleted successfully");
            return promise.done(null, {message: 'message deleted successfully'});
        }
    });
    return promise;
};

messageSchema.statics.deletemessages = function deletemessages (query) {
    var promise = new Hope.Promise();
    this.remove(query,function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("message deleted successfully");
            return promise.done(null, {message: 'message deleted successfully'});
        }
    });
    return promise;
};

messageSchema.methods.parse = function parse () {
    var message = this;

    var parseMessage = {
        id          : message._id,
        channel: {
            id         : (message._channel._id) ? message._channel._id : message._channel,
            channelName: (message._channel.channelName) ? message._channel.channelName : ''

},
        user: {
            id         : (message._user._id) ? message._user._id : message._user,
            username   : (message._user.username) ? message._user.username :  ''
        },
        date        : message.datetime,
        messageType : message.messageType,
        text        : message.content.text
    };

    if (message.messageType == 'FILE') {
        parseMessage.filename = message.content.filename;
    }

    if (message.messageType == 'QUESTION') {
        var answer;

        parseMessage.title = message.content.title;
        parseMessage.answers = [];
        for (var i = 0; i < message.content.answers.length; i++) {
            answer = {
                user: message.content.answers[i]._user.parse(),
                date: message.content.answers[i].datetime,
                text: message.content.answers[i].text
            };
            parseMessage.answers.push(answer);
        }
    }

    return parseMessage;
};

//Crear mapeado y copiar coleccion elastic,solo ejecutar la primera vez

var Message = mongoose.model('Message', messageSchema);
Message.createMapping(function(err, mapping){
   if(err){
   //  console.log('error creating mapping (you can safely ignore this)');
   //  console.log(err);
   }else{
    // console.log('mapping created!');
    // console.log(mapping);
   }
 });



var Message = mongoose.model('Message', messageSchema)
  , stream = Message.synchronize()
  , count = 0;

stream.on('data', function(err, doc){
  count++;
});
stream.on('close', function(){
  console.log('indexed message ' + count + ' documents!');
});
stream.on('error', function(err){
  console.log(err);
});




module.exports = mongoose.model('Message', messageSchema);
