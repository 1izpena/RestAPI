var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var groupSchema   = new Schema({
    groupName: { type: String, required: true },
    _admin: { type: Schema.ObjectId, ref: 'User' },
    channels:  [ { type: Schema.ObjectId, ref: 'Channel' }]
});

module.exports = mongoose.model('Group', groupSchema);

