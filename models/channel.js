'use strict';

var mongoose = require('mongoose');
var Hope = require('hope');
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

/* static methods */
/* NUEVO CANAL , guarda el nuevo grupo y hace el populate a grupo */

channelSchema.statics.newchannel = function newchannel (attributes,userid, groupid) {
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel', channelSchema);
    var Group = mongoose.model('Group');
    var User = mongoose.model('User');
    Channel = new Channel(attributes).save(function (error, result) {
        if(error){
            var messageError = '';
            if (error.errors.channelName != undefined)
                messageError= error.errors.channelName;
            error = { code: 400, message: messageError };
            return promise.done(error, null);
        }else {
            var channel = result;
            var options = { safe: true, upsert: true };
            var selection = { _id: groupid};
            var updateQuery = { $push: { channels: channel.id} };
            Group.update(selection,updateQuery,options,function (error){
                if(error){
                    return promise.done(error,null);
                }else{
                    if (channel.channelType == "PRIVADO"){
                        var selection = { _id: userid, _group: groupid };
                        var updateQuery = { $push: {privateChannels: channel._id} };
                        var options = { safe: true, upsert: true };
                        var User = mongoose.model('User');
                        User.update(selection,updateQuery,options,function (error){
                            if(error){
                                return promise.done(error,null);
                            }else{
                                return promise.done(error, channel);
                            }
                        });
                    }else {
                        return promise.done(error, channel);
                    }

                }
            });
        }
    });
    return promise;
};

/* BUSCAR */
channelSchema.statics.search = function search (query, limit) {
    var promise = new Hope.Promise();
    this.find(query).limit(limit).exec(function(error, value) {
        if (limit === 1 && !error) {
            if (value.length === 0) {
                error = {
                    code: 402,
                    message: "Group not found."
                };
            }
            value = value[0];
        }
        return promise.done(error, value);
    });
    return promise;
};

/* ACTUALIZAR */
channelSchema.statics.updatechannel = function updatechannel (id, update, options) {
    var promise = new Hope.Promise();
    this.findByIdAndUpdate(id, update, options,function(error, group) {
        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(error, group);
        }
    });
    return promise;
};

channelSchema.methods.parse = function parse () {
    var channel = this;
    return {
        id         : channel._id,
        channelName: channel.channelName,
        channelType: channel.channelType
    };
};

module.exports = mongoose.model('Channel', channelSchema);


