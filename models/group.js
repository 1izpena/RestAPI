'use strict';

var Hope      	= require('hope');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var groupSchema   = new Schema({
    groupName: { type: String, required: true },
    _admin: { type: Schema.ObjectId, ref: 'User' },
    channels:  [ { type: Schema.ObjectId, ref: 'Channel' }],
    users:  [ { type: Schema.ObjectId, ref: 'User' }],
    invitedUsers:  [ { type: Schema.ObjectId, ref: 'User' }]
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


    console.log("esto vale query");


    /*************
     *
     * { _id: { groupId: 56cb893773da764818ec5df0, groupName: 'Dessi' } }
     *
     *
     * *****************/

    console.log(query);

    this.find(query).skip(skip).limit(limit).exec(function(error, value) {

        /* value me da undefined */

        console.log("esto vale value + error groupschema search");
        console.log(value);
        console.log(error);



        if (limit === 1 && !error) {
            if (value.length === 0) {
                error = {
                    code: 400,
                    message: "Group not found."
                };
            }
            value = value[0];
        }else {


            if(value !== undefined && value !== null){
                value.forEach(function(group){
                    group = group.parse();
                    value2.push(group);
                });
                value= value2;

            }



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
                return promise.done(null, group);
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
                return promise.done(null, group);
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
            return promise.done(null, {message: 'group deleted successfully'});
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





groupSchema.statics.parsepopulated = function parsepopulated (userid,groupid) {
    var query = { _id: groupid};
    var populate = 'channels users _admin';
    var promise = new Hope.Promise();
    this.findOne(query).populate(populate).populate({
        path:     'channels',
        populate: { path:  'users', model: 'User' }
    }).exec(function (error, group) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (group){
                var publicos = [];
                var privados = [];
                var directos = [];
                var usuarios = [];
                for (var i=0;i<group.channels.length;i++){
                    if (group.channels[i].channelType == "PUBLIC"){
                        var elto = {
                            id        : group.channels[i]._id,
                            channelName  : group.channels[i].channelName

                        };

                        if(group.channels[i].scrum == true){
                            elto.scrum = true;
                            console.log("entro en canal:");
                            console.log(group.channels[i].channelName);
                            console.log("tiene scrum");

                        }


                        publicos.push(elto);
                    }if (group.channels[i].channelType == "PRIVATE"){
                        var encontrado = false;
                        var j = 0;

                        /* mira si lo encuentra y sale del while */
                        while (encontrado == false && j<group.channels[i].users.length){

                            /* igual esto se puede quitar */

                            if (userid == group.channels[i].users[j]._id){
                                var usuariosCanal = [];
                                for (var l=0;l<group.channels[i].users.length;l++){
                                    var usuario = {
                                        id: group.channels[i].users[l]._id,
                                        username: group.channels[i].users[l].username,
                                        mail: group.channels[i].users[l].mail
                                    };
                                    usuariosCanal.push(usuario);
                                }
                                var elto2 = {
                                    id        : group.channels[i]._id,
                                    channelName  : group.channels[i].channelName,
                                    users: usuariosCanal
                                };

                                if(group.channels[i].scrum == true){
                                    elto2.scrum = true;
                                    console.log("entro en canal:");
                                    console.log(group.channels[i].channelName);
                                    console.log("tiene scrum");

                                }



                                privados.push(elto2);
                                encontrado = true;
                            }
                            j++;
                        }
                    }if (group.channels[i].channelType == "DIRECT"){
                        if (group.channels[i].users.length == 2) {
                            if (group.channels[i].users[0]._id == userid ||
                                group.channels[i].users[1]._id == userid) {

                                var elto3 = {
                                    id        : group.channels[i]._id,
                                    channelName  : group.channels[i].channelName,
                                    users : [group.channels[i].users[0]._id, group.channels[i].users[1]._id]
                                };
                                directos.push(elto3);
                            }
                        }
                    }

                }
                for (var k=0;k<group.users.length;k++){
                    var elto4 = {
                        id        : group.users[k]._id,
                        username  : group.users[k].username,
                        mail      : group.users[k].mail
                    };
                    usuarios.push(elto4);
                }
                var elto5 = {
                    id        : group._admin._id,
                    username  : group._admin.username,
                    mail      : group._admin.mail
                };
                var vuelta = {
                    id: group._id,
                    groupName: group.groupName,
                    admin: elto5,
                    users: usuarios,
                    publicChannels: publicos,
                    privateChannels: privados,
                    directMessageChannels: directos
                };
                return promise.done(null,vuelta);
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

module.exports = mongoose.model('Group', groupSchema);

