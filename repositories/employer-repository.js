var User = require('../models/user.js');
var _ = require('underscore');
var RSVP = require('rsvp');
var Mixins = require('./mixins');
var Errors = require('./errors');

var conn;

var EmployerRepository = {
  /**
   * Sets the MongoDB connection to be used by this repository.
   * @constructor
   * @param {MongoClient} _conn - A connected MongoDB client.
   */
  "init":function(_conn){
    conn = _conn;
  },
  /**
   * Persist a new employer, along with the user as admin.
   * @param {Employer} employer - The employer to be persisted.
   * @param {User} user - The user to be persisted as this employer's admin.
   * @param {function} [callback] - Optional. Function to be called passing the
   *  inserted employer.
   * @returns {Promise} A promise object.
   */
  "insert":function(employer,user,callback){
    var _user = _.extend({},user,{"pwdHash":user.getPasswordHash()});
    var _employer = _.extend({},employer,{"admins":[]});
    return new RSVP.Promise(function(resolve,reject){
      var db;
      conn.then(function(_db){
        db = _db; // Cache the DB object to be used later
        return db.collection('users').insertOne(_user);
      }).then(function(result){
        // User inserted, now insert the employer
        _employer.admins.push(_user._id);
        return db.collection('employers').insertOne(_employer).then(function(result){
          // Insert successful, set up the return object and resolve promise.
          employer._id = _employer._id;
          user._id = _user._id;
          employer.admins.push(user);
          resolve(employer);
        }).catch(function(error){
          // Inserting employer fails, clean up the user first then exit.
          db.collection('users').remove({"_id":_user._id},null,function(err,result){
            if (error.code == 11000)
              error = new Errors.DuplicateNameError("This employer has already been registered with our system.",error);
            reject(error);
          });
        });
      }).catch(function(error){
        // Inserting user fails
        if (error.code == 11000)
          error = new Errors.DuplicateEmailError("This email has already been registered with our system.",error);
        reject(error);
      });
    });
  },
  /**
   * Find and retrieve one existing employer based on query.
   * @param {string} query - The object container the query parameters.
   * @param {function} [callback] - Optional. Function to be called passing the employer.
   * @returns {Promise} A promise object.
   */
  "findOne":function(query,callback){
    var self = this;
  }
};

module.exports = _.extend(EmployerRepository,Mixins,{"errors":Errors});
