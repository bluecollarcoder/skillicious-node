var User = require('../models/user.js');
var _ = require('underscore');
var RSVP = require('rsvp');

var conn;

module.exports = {
  /**
   * Sets the MongoDB connection to be used by this repository.
   * @constructor
   * @param {MongoClient} _conn - A connected MongoDB client.
   */
  "init":function(_conn){
    conn = _conn;
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
        resolve(user);
      }).catch(function(error){
        reject(error);
      });
    });
  }
};
