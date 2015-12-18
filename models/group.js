'use strict';

var Hope      	= require('hope');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var groupSchema   = new Schema({
    groupName: { type: String, required: true },
    _admin: { type: Schema.ObjectId, ref: 'User' },
    channels:  [ { type: Schema.ObjectId, ref: 'Channel' }]
});

/* static methods */
/* NUEVO GRUPO , guarda el nuevo grupo */
groupSchema.statics.newgroup = function newgroup (attributes,userid) {
    var promise = new Hope.Promise();
    var Group = mongoose.model('Group', groupSchema);
    Group = new Group(attributes);
    Group.save(function (error, group) {
        if(error){
            var messageError = '';
            if (error.errors.groupName != undefined)
                messageError = 'Group name required';
            error = { code: 400, message: messageError };
            return promise.done(error, null);
        }else {
            var privatechannels = [];
            var dat = {
                _group: group.id,
                privateChannels: privatechannels
            };
            var selection = { _id: userid};
            var updateQuery = { $push: { _group: group.id,privateChannels: privatechannels} };
            var options = { safe: true, upsert: true };
            //var update ={$push: {'groups': {'_group':group.id,'privateChannels':privatechannels}}};
            var User = mongoose.model('User');
            User.update(selection,updateQuery,options,function (error){
                if(error){
                    return promise.done(error,null);
                }else{
                    return promise.done(error, group);
                }
            });
        }
    });
    return promise;
};


/* BUSCAR */
groupSchema.statics.search = function search (query, limit) {
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
groupSchema.statics.updategroup = function updategroup (id, update, options) {
    var promise = new Hope.Promise();
    this.findByIdAndUpdate(id, update, options,function(error, group) {
        if (error) {
            console.log("error al updategroup: " + error);
            return promise.done(error, null);
        }else {
            return promise.done(error, group);
        }
    });
    return promise;
};

groupSchema.methods.parse = function parse () {
    var group = this;
    return {
        id:        group._id,
        groupName: group.groupName,
        admin:     group._admin,
        channels:  group.channels
    };
};


module.exports = mongoose.model('Group', groupSchema);

