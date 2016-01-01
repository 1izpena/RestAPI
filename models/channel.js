'use strict';

var mongoose = require('mongoose');
var Hope = require('hope');
var Schema = mongoose.Schema;


var channelSchema   = new Schema({
    channelName: { type: String, required: true },
    channelType: { type: String, required: true },
    users:  [ { type: Schema.ObjectId, ref: 'User' }]
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

channelSchema.statics.createchannel = function createchannel (attributes,userid, groupid) {
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel', channelSchema);
    var Group = mongoose.model('Group');
    var User = mongoose.model('User');
    Channel = new Channel(attributes).save(function (error, result) {
        if(error){
            var messageError = '';
            if (error.errors.channelName != undefined)
                messageError = 'channel name is required';
            else if (error.errors.channelType != undefined)
               messageError = 'channel type is required: PUBLIC/PRIVATE';
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
                    return promise.done(error, channel);
                }
            });
        }
    });
    return promise;
};

/* BUSCAR */
channelSchema.statics.search = function search (query, limit, page) {
    /* skip is number of results that not show */
    if(typeof page === "undefined") {
        page = 0;
    }
    if(typeof limit === "undefined") {
        limit = 0;
    }
    var skip = (page * limit);
    var promise = new Hope.Promise();
    var value2 = [];
    this.find(query).skip(skip).limit(limit).exec(function(error, value) {
        if (limit === 1 && !error) {
            if (value.length === 0) {
                error = {
                    code: 402,
                    message: "Group not found."
                };
            }
            value = value[0];
        }
        else {
            value.forEach(function(channel){
                channel = channel.parse();
                value2.push(channel);
            });
            value= value2;
        } /* end else:: want multiple values & parse this values */
        return promise.done(error, value);
    });
    return promise;
};

/* ACTUALIZAR */
channelSchema.statics.updatechannel = function updatechannel (id, update, options) {
    var promise = new Hope.Promise();
    this.findByIdAndUpdate(id, update, options,function(error, channel) {
        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(null, channel);
        }
    });
    return promise;
};

/* ELIMINAR */
channelSchema.statics.deletechannel = function deletechannel (id) {
    var promise = new Hope.Promise();
    this.remove(id,function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(null, {message: 'channel deleted successfully'});
        }
    });
    return promise;
};

channelSchema.methods.parse = function parse () {
    var channel = this;
    return {
        id         : channel._id,
        channelName: channel.channelName,
        channelType: channel.channelType,
        users: channel.users
    };
};

module.exports = mongoose.model('Channel', channelSchema);


