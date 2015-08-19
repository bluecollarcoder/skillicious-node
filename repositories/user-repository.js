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
   * Persist a new user.
   * @param {User} user - The user to be persisted.
   * @param {function} [callback] - Optional. Function to be called passing the
   *  inserted user.
   * @returns {Promise} A promise object.
   */
  "insert":function(user,callback){
    return new RSVP.Promise(function(resolve,reject){
      conn.then(function(db){
        return db.collection('users').insertOne(user);
      }).then(function(result){
        console.log(result);
        resolve();
      }).catch(function(error){
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
    return new RSVP.Promise(function(resolve,reject){
      conn.then(function(db){
        return db.collection('users').find(query).toArray();
      }).then(function(arr){
        if (!arr.length)
          throw new Error("User not found");
        var users = _.map(arr,function(obj){
          return User.create(obj);
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
  }
};
