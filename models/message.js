var mongoose = require('mongoose');

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

module.exports = mongoose.model('message', messageSchema);


