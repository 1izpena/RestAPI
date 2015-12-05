var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var channelSchema   = new Schema({
    channelName: { type: String, required: true },
    channelType: { type: String, required: true }
});

channelSchema.path('channelType').validate(function(channelType){
        if(channelType == 'PUBLIC' || channelType == 'PRIVATE' )
        {
            return true
        }
        else {
            return false
        }
    }, 'Valid values form channelType: PUBLIC or PRIVATE');

module.exports = mongoose.model('Channel', channelSchema);


