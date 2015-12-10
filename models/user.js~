'use strict'

var Hope      	= require('hope');
var mongoose 	= require('mongoose');
var Schema 	= mongoose.Schema;
var bcrypt    	= require('bcrypt');
var config 	= require('../config');



var userSchema = new Schema({
  username  : { type: String, required: true },
  password  : { type: String, required: true },
  mail      : {
    type  : String,
    unique: true, 
    required: true
  },
  groups      : [ { _group: { type: Schema.ObjectId, ref: 'Group'},
                      privateChannels: [ { type: Schema.ObjectId, ref: 'Channel' }]
                    }]
  
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
    mail: attributes.mail
  }, function (error, user) {
    if (user) {
      error = { code: 409, message: 'Mail already registered.' };
      return promise.done(error, null);
    } else {

      var User = mongoose.model('User', userSchema);
      return new User(attributes).save(function (error, result) {
	
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
    
     if (user && bcrypt.compareSync(attributes.password, user.password)) {
      return promise.done(null, user);

    } else {
      error = {
        code: 403,
        message: "Incorrect credentials."
      };
      return promise.done(error, null);
    }
  });
  return promise;
};


/* BUSCAR */
userSchema.statics.search = function search (query, limit) {
  var promise = new Hope.Promise();

  this.find(query).limit(limit).exec(function(error, value) {
    if (limit === 1 && !error) {
      if (value.length === 0) {
        error = {
          code: 402,
          message: "User not found."
        };
      }
      value = value[0];
    }

    return promise.done(error, value);
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
