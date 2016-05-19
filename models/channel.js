'use strict';

var mongoose = require('mongoose');
var Hope = require('hope');
var Schema = mongoose.Schema;



var Repositories = new Schema({
    id     : Number
    , name      : String
    , hookid      : Number
});




var channelSchema   = new Schema({
    channelName: { type: String, required: true },
    channelType: { type: String, required: true },
    users:  [ { type: Schema.ObjectId, ref: 'User' }],
    group:  { type: Schema.ObjectId, ref: 'Group' },
    _admin:  { type: Schema.ObjectId, ref: 'User' },
    githubUsername: { type: String, required: false },
    /*
    githubtoken: [{
        username: {type: String, required: false},
        token: {type: String, required: false}
    }],
    */

    githubRepositories: [Repositories],
    scrum:{ type: Boolean, required: false }
});

channelSchema.path('channelType').validate(function(channelType){
    if(channelType == 'PUBLIC' || channelType == 'PRIVATE' || channelType == 'DIRECT')
    {
        return true
    }
    else {
        return false
    }
}, 'Valid values form channelType: PUBLIC or PRIVATE or DIRECT');

/* static methods */
/* NUEVO CANAL , guarda el nuevo grupo y hace el populate a grupo */

channelSchema.statics.createchannel = function createchannel (attributes, repositories) {
    var promise = new Hope.Promise();
    var Channel = mongoose.model('Channel', channelSchema);

    var m = new Channel(attributes);

    /* ahora repositories es arrReposOk, nos interesa .item (.id,.name .hookid y
     * githubtoken con
     * { "token" : "120dbe14caca8f6efb2e2b54597ae49ec557e5e1", "username" : "1izpena" },
     * ahora token seria token.token && token.authid
     * no necesito mas o si para saber si esta ready
      * porque el token tambien lo uso para borrar webhooks y si no esta vigente no me vale */

    if(repositories !== null && repositories !== undefined){
        if(repositories.length >0){

            for(var i = 0; i< repositories.length; i++){
                /* intentamos meter directamente el objeto */
                console.log("esto vale repositories[i].item");
                console.log(repositories[i].item);
                m.githubRepositories.push(repositories[i].item);

            }


        }

    }


    m.save(function (error, result) {

        if(error){

            console.log("creando canal peta");
            console.log(error);
            var messageError = '';
            if (error.errors.channelName != undefined)
                messageError = 'channel name is required';
            else if (error.errors.channelType != undefined)
               messageError = 'channel type is required: PUBLIC/PRIVATE/DIRECT';
            error = { code: 400, message: messageError };
            return promise.done(error, null);
        }else {

            if (result === null) {
                console.log("creando canal peta con null");

                error = { code: 400, message: 'Channel not found.' };
                return promise.done(error, null);
            }else {
                console.log("no null, con result =");
                console.log(result);
                return promise.done (null,result);
            }
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
        if (error) {
            return promise.done(error, null);
        }
        if (limit === 1) {
            if (value.length === 0) {
                error = {
                    code: 400,
                    message: "Channel not found."
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

channelSchema.statics.searchpopulated = function searchpopulated (query,populate) {
    var promise = new Hope.Promise();
    this.findOne(query).populate(populate).exec(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (channel){
                promise.done(null, channel);
            }else {
                var err = {
                    code   : 400,
                    message: 'channel not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};


/* actualizar todos aquellos que coincidan con el repo
* updaterepositoriesgithubtoken */


channelSchema.statics.updaterepositoriesgithubtoken = function updaterepositoriesgithubtoken (query, update, options) {

    console.log("entro en updaterepositoriesgithubtoken dentro de models/channels.js");

    var promise = new Hope.Promise();
    this.update(query, update, options,function(error, channel) {
        console.log("esto devuelve el metodo update");
        console.log("error");
        console.log(error);
        console.log("channel");
        console.log(channel);

        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(null, channel);
        }
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
            if (channel){
                promise.done(null, channel);
            }else {
                var err = {
                    code   : 400,
                    message: 'channel not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

channelSchema.statics.updatechannels = function updatechannels (query, update, options) {
    var promise = new Hope.Promise();
    this.update(query, update, options,function(error, channel) {
        if (error) {
            return promise.done(error, null);
        }else {
            if (channel){
                promise.done(null, channel);
            }else {
                var err = {
                    code   : 400,
                    message: 'channel not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

/* ELIMINAR */
channelSchema.statics.deletechannel = function deletechannel (id) {
    var promise = new Hope.Promise();
    this.remove({_id:id},function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("channel deleted successfully");
            return promise.done(null, {message: 'channel deleted successfully'});
        }
    });
    return promise;
};

channelSchema.statics.deletechannels = function deletechannels (query) {
    var promise = new Hope.Promise();
    this.remove(query,function(error) {
        if (error) {
            return promise.done(error, null);
        }else {
            console.log("channel deleted successfully");
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
        scrum: channel.scrum,
        users: channel.users,
        admin: channel._admin
    };
};

channelSchema.statics.parsepopulated = function parsepopulated (channelid) {
    var query = { _id: channelid};
    var populate = 'group users _admin';
    var promise = new Hope.Promise();
    this.findOne(query).populate(populate).exec(function (error, channel) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (channel){
                var usuarios = [];
                var k;
                for (k=0;k<channel.users.length;k++){
                    var elto4 = {
                        id        : channel.users[k]._id,
                        username  : channel.users[k].username,
                        mail      : channel.users[k].mail
                    };
                    usuarios.push(elto4);
                }
                var elto5 = {
                    id        : channel._admin._id,
                    username  : channel._admin.username,
                    mail      : channel._admin.mail
                };
                var eltoGroup = {
                    groupId: channel.group._id,
                    groupName: channel.group.groupName
                };
                var vuelta = {
                    id: channel._id,
                    channelName: channel.channelName,
                    channelType: channel.channelType,
                    group: eltoGroup,
                    admin: elto5,
                    users: usuarios
                };


                if(channel.scrum == true){
                    console.log("etro en channel.scrum == true");
                    vuelta.scrum = true;
                }
                else{
                    vuelta.scrum == false;
                }


                return promise.done(null, vuelta);
            }else {
                var err = {
                    code   : 400,
                    message: 'channel not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;

};


module.exports = mongoose.model('Channel', channelSchema);


