'use strict';

var Hope      	= require('hope');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var groupSchema   = new Schema({
    groupName: { type: String, required: true },
    _admin: { type: Schema.ObjectId, ref: 'User' },
    channels:  [ { type: Schema.ObjectId, ref: 'Channel' }],
    users:  [ { type: Schema.ObjectId, ref: 'User' }]
});

/* static methods */
/* NUEVO GRUPO , guarda el nuevo grupo */
groupSchema.statics.creategroup = function creategroup (attributes,userid) {
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
            return promise.done(error, group);
        }
    });
    return promise;
};


/* BUSCAR */
groupSchema.statics.search = function search (query, limit, page) {
    var promise = new Hope.Promise();
    /* skip is number of results that not show */
    if(typeof page === "undefined") {
        page = 0;
    }
    if(typeof limit === "undefined") {
        limit = 0;
    }
    var skip = (page * limit);
    var value2 = [];
    this.find(query).skip(skip).limit(limit).exec(function(error, value) {
        if (limit === 1 && !error) {
            if (value.length === 0) {
                error = {
                    code: 400,
                    message: "Group not found."
                };
            }
            value = value[0];
        }else {
            value.forEach(function(group){
                group = group.parse();
                value2.push(group);
            });
            value= value2;
        } /* end else:: want multiple values & parse this values */
        return promise.done(error, value);
    });
    return promise;
};

groupSchema.statics.searchpopulated = function searchpopulated (query,populate) {
    var promise = new Hope.Promise();
    this.findOne(query).populate(populate).exec(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (group){
                promise.done(null, group);
            }else {
                var err = {
                    code   : 400,
                    message: 'group not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

/* ACTUALIZAR */
groupSchema.statics.updategroup = function updategroup (id, update, options) {
    var promise = new Hope.Promise();
    this.findByIdAndUpdate(id, update, options,function(error, group) {
        if (error) {
            return promise.done(error, null);
        }else {
            if (group){
                promise.done(null, group);
            }else {
                var err = {
                    code   : 400,
                    message: 'group not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

/* ELIMINAR */
groupSchema.statics.deletegroup = function deletegroup (id) {
    var promise = new Hope.Promise();
    this.remove({_id:id},function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(error, {message: 'group deleted successfully'});
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
        channels:  group.channels,
        users:     group.users
    };
};


module.exports = mongoose.model('Group', groupSchema);

