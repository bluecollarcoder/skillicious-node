var User = require('../models/user.js');
var _ = require('underscore');
var RSVP = require('rsvp');
var Mixins = require('./mixins');

var conn;

var UserRepository = {
  /**
   * Sets the MongoDB connection to be used by this repository.
   * @constructor
   * @param {MongoClient} _conn - A connected MongoDB client.
   */
  "init":function(_conn){
    conn = _conn;
  },
  /**
   * Persist a new user.
   * @param {User} user - The user to be persisted.
   * @param {function} [callback] - Optional. Function to be called passing the
   *  inserted user.
   * @returns {Promise} A promise object.
   */
  "insert":function(user,callback){
    user = _.extend({},user,{"pwdHash":user.getPasswordHash()});
    return new RSVP.Promise(function(resolve,reject){
      conn.then(function(db){
        return db.collection('users').insertOne(user);
      }).then(function(result){
        console.log(result);
        resolve();
      }).catch(function(error){
        if (error.code == 11000)
          error = new DuplicateEmailError("This email has already been registered with our system.",error);
        reject(error);
      });
    });
  },
  /**
   * Find and retrieve one existing user based on query.
   * @param {string} query - The object container the query parameters.
   * @param {function} [callback] - Optional. Function to be called passing the user.
   * @returns {Promise} A promise object.
   */
  "findOne":function(query,callback){
    var self = this;
    return new RSVP.Promise(function(resolve,reject){
      conn.then(function(db){
        return db.collection('users').find(self.processQuery(query)).toArray();
      }).then(function(arr){
        if (!arr.length)
          throw new Error("User not found");
        var users = _.map(arr,function(obj){
          return new User.GenericUser(obj);
        });
        if (callback)
          callback(users[0]);
        resolve(users[0]);
      }).catch(function(error){
        reject(error);
      });
    });
  },
  /**
   * Find and retrieve multiple existing users based on query.
   * @param {Object} query - The object containing the query parameters.
   * @param {function} [callback] - Optional. Function to be called passing the array
   *  of matching users.
   * @returns {Promise} A promise object.
   */
  "find":function(query,callback){
    return new RSVP.Promise(function(resolve,reject){
      conn.then(function(db){
        return db.collection('users').find().toArray();
      }).then(function(arr){
        var users = _.map(arr,function(obj){
          return User.create(obj);
        });
        if (callback)
          callback(users);
        resolve(users);
      }).catch(function(error){
        reject(error);
      });
    });
  },
  "error":{
    "DuplicateEmailError":DuplicateEmailError
  }
};

function DuplicateEmailError(message,err){
  Error.call(this);
  this.name = "DuplicateEmailError";
  this.message = message;
  if (err)
    this.stack = err.stack;
}
DuplicateEmailError.prototype = Object.create(Error.prototype);
DuplicateEmailError.prototype.constructor = DuplicateEmailError;

module.exports = _.extend(UserRepository,Mixins);
