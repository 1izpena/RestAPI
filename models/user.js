'use strict';

var Hope      	= require('hope');
var mongoose 	= require('mongoose');
var Schema 	= mongoose.Schema;
var bcrypt    	= require('bcrypt');
var validators 	= require('mongoose-validators');
var config 	= require('../config');




var userSchema = new Schema({
  username  : { type: String, required: true },
  password  : { type: String, required: true },
  mail      : {
    type  : String,
    unique: true, 
    required: true,
    validate: validators.isEmail({message: 'Mail format is invalid'}) 
  },
  social: [],
  groups      : [ { _group: { type: Schema.ObjectId, ref: 'Group'},
                      privateChannels: [{type: Schema.ObjectId, ref: 'Channel'}],
                      directMessageChannels: [{type: Schema.ObjectId, ref: 'Channel'}]
                    }],
  active  : { type: Boolean, default: false },
  id_social  : { type: Number, required: false },
  invitations:  [ { type: Schema.ObjectId, ref: 'Group' }]
  
});

userSchema.pre('save', function (next) {
  var user = this;

  if (!user.isModified('password')) return next();
  
  bcrypt.genSalt(config.salt_work_factor, function(error, salt) {
    if (error) return next(error);

    bcrypt.hash(user.password, salt, function(error, hash) {
      if (error) return next(error);
      user.password = hash;
      next();
    });
  });
});

/* static methods */
/* REGISTRO , mira si el mail es unico, si lo es guardar el usuario */

userSchema.statics.signup = function signup (attributes) {
  var promise = new Hope.Promise();
  this.findOne({
    mail: attributes.mail, 
  }, function (error, user) {
    if (user) {
     if(user.social === []){ // si solo se ha registrado por mail
      error = { code: 409, message: 'Mail already registered.' };
      return promise.done(error, null);
     }else{ // si se ha registrado por red social
      console.log("solo red social");
    user.password=attributes.password;
      user.save(function (err){
        if(err) return promise.done(error,null);
        else
        {
          return promise.done(null,user);
        }
      });
     }
    return promise.done(error, user);
    } else {
      var User = mongoose.model('User', userSchema);
      return new User(attributes).save(function (error, result) {

  if(error){

    var messageError = '';
    if (error.errors.username != undefined)
      messageError = error.errors.username.message;
  
    else if(error.errors.password != undefined)
      messageError = error.errors.password.message;

    else if(error.errors.mail != undefined)
      messageError = error.errors.mail.message;
  

    error = { code: 400, message: messageError };
    return promise.done(error, null);
   }  


  
        return promise.done(error, result);
      });
    }
  });
  return promise;
};


/* LOGGEARSE */
userSchema.statics.login = function login (attributes) {
  var promise = new Hope.Promise();
  var user = this;
  user.findOne({
    mail: attributes.mail
  }, function(error, user) {
    
     if (user && bcrypt.compareSync(attributes.password, user.password) && (user.active===true)) {
      return promise.done(null, user);

    } else {
        if (user && bcrypt.compareSync(attributes.password, user.password) && (user.active===false)) {
        error = {
        code: 401,
        message: "Must activate account.Check your email.",
        user: user
      };}
      else{
      error = {
        code: 403,
        message: "Incorrect credentials."
      };}
      return promise.done(error, null);
    }
  });
  return promise;
};


/* BUSCAR */
userSchema.statics.search = function search (query, limit, page) {

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
          message: "User not found."
        };
      }
      value = value[0];

    } else {

	value.forEach(function(user){
		
		user = user.parse();
		value2.push(user);

	});
     value= value2;
   } /* end else:: want multiple values & parse this values */



    return promise.done(error, value);
  });
  return promise;
};

userSchema.statics.searchpopulated = function searchpopulated (query,populate) {
    var promise = new Hope.Promise();
   
    this.findOne(query).populate(populate).exec(function (error, user) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (user){
                promise.done(null, user);
            }else {
                var err = {
                    code   : 403,
                    message: 'user not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

userSchema.statics.searchpopulatedmany = function searchpopulatedmany (query,populate) {
    var promise = new Hope.Promise();
    this.find(query).populate(populate).exec(function (error, users) {
        if (error){
            return promise.done(error,null);
        }
        else {
            if (users){
                promise.done(null, users);
            }else {
                var err = {
                    code   : 403,
                    message: 'user not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

/*CAMBIAR CONTRASEÑA*/
userSchema.statics.reset = function reset(attributes){
  var promise = new Hope.Promise();
  var user = this;
  user.findById(attributes.id,function(err,user){
    if (err) return  promise.done(err,null);
    else
    {
      user.password = attributes.newPass;
      user.save(function (err){
        if(err) return promise.done(error,null);
        else
        {
          return promise.done(null,user);
        }
      });
    }    
  });
  return promise;
};


/*ACTUALIZAR */
userSchema.statics.updateuser = function updateuser (id, update, options) {
    var promise = new Hope.Promise();
    this.findByIdAndUpdate(id, update, options,function(error, user) {
        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(null, user);
        }
    });
    return promise;
};

userSchema.statics.updateusers = function updateusers (query, update, options) {
    var promise = new Hope.Promise();
    this.update(query, update, options,function(error, user) {
        if (error) {
            return promise.done(error, null);
        }else {
            if (user){
                promise.done(null, user);
            }else {
                var err = {
                    code   : 400,
                    message: 'user not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};

//ACTIVAR CUENTA
userSchema.statics.activate = function activate(attributes){
  var promise = new Hope.Promise();
  var user = this;

  user.findById(attributes.id,function(err,user){
    if (err) return  promise.done(err,null);
    else
    {
      user.active = true;
      user.save(function (err){
        if(err) return promise.done(error,null);
        else
        {
          return promise.done(null,user);
        }
      });
    }    
  });
  return promise;
};

//actualizar varios usuarios
userSchema.statics.updateusers = function updateusers (query, update, options) {
    var promise = new Hope.Promise();
    this.update(query, update, options,function(error, user) {
        if (error) {
            return promise.done(error, null);
        }else {
            if (user){
                promise.done(null, user);
            }else {
                var err = {
                    code   : 400,
                    message: 'user not found'
                };
                return promise.done(err, null);
            }
        }
    });
    return promise;
};
//eliminar cuenta
userSchema.statics.remove = function remove(attributes){
  var promise = new Hope.Promise();
  var user = this;
  user.findById(attributes.id,function(err,user){
    if (err) return  promise.done(err,null);
    else
    {     

      user.remove(function (err){
        if(err) return promise.done(error,null);
        else
        {
          return promise.done(null,user);
        }
      });
    }    
  });
  return promise;
};

//login redes sociales
userSchema.statics.social = function social (attributes) {

   var promise = new Hope.Promise(); 
   this.findOneAndUpdate({mail: attributes.mail}, {$addToSet: {social:{'network': attributes.network, 'uid': attributes.uid }}}, {}, function(err,user) { 
     if(user){ 
      return  promise.done(null,user);  
    }
    else{
    attributes.social={'network': attributes.network, 'uid': attributes.uid };
    attributes.username=attributes.uid;
    var User = mongoose.model('User', userSchema);
    User = new User(attributes);

      User.save(function (err){     
        if(err) return promise.done(err,null);
      });
    }; 
   });
   return promise;
    };



/* Instance methods
   para que no te muestre la contraseña y el id no sea _id
 */

userSchema.methods.parse = function parse () {
  var user = this;
  return {
    id        : user._id,
    username  : user.username,
    mail      : user.mail
  };
};




/* exportamos el schema con nombre User */
module.exports = mongoose.model('User', userSchema);
