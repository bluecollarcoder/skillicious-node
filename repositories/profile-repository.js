var User = require('../models/user.js');
var Mixins = require('./mixins');
var _ = require('underscore');
var RSVP = require('rsvp');

var conn;

var ProfileRepository = {
  /**
   * Sets the MongoDB connection to be used by this repository.
   * @constructor
   * @param {MongoClient} _conn - A connected MongoDB client.
   */
  "init":function(_conn){
    conn = _conn;
  },
  /**
   * Find and retrieve one profile based on user _id.
   * @param {string} query - The object container the query parameters.
   * @param {function} [callback] - Optional. Function to be called passing the user.
   * @returns {Promise} A promise object.
   */
  "findOne":function(id,callback){
    var self = this;
    return new RSVP.Promise(function(resolve,reject){
      conn.then(function(db){
        return db.collection('users').find(self.processQuery({"_id":id})).toArray();
      }).then(function(arr){
        if (!arr.length)
          throw new Error("User not found");
        var users = _.map(arr,function(obj){
          return User.create(obj);
        });
        if (callback)
          callback(users[0].profile);
        resolve(users[0].profile);
      }).catch(function(error){
        reject(error);
      });
    });
  },
  /**
   * Persist profile for an existing user.
   * @param {User} user - The user to be persisted.
   * @param {function} [callback] - Optional. Function to be called passing the
   *  updated user.
   * @returns {Promise} A promise object.
   */
  "updateOne":function(user,callback){
    return new RSVP.Promise(function(resolve,reject){
      conn.then(function(db){
        return db.collection('users').update({"_id": user._id},{
          $set: {
            "profile": user.profile
          }
        });
      }).then(function(result){
        resolve(user.profile);
      }).catch(function(error){
        reject(error);
      });
    });
  }
};

module.exports = _.extend(ProfileRepository,Mixins);
