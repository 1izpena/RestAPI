var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var userSchema   = new Schema({
    username    : { type: String, required: true },
    password    : { type: String, required: true },
    mail        : { type: String, required: true },
    groups      : [ { _group: { type: Schema.ObjectId, ref: 'Group'},
                      privateChannels: [ { type: Schema.ObjectId, ref: 'Channel' }]
                    }]
});

module.exports = mongoose.model('User', userSchema);
