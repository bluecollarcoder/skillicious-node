var jwt = require('jsonwebtoken');
var CryptoJS = require('crypto-js');
var _ = require('underscore');
var config = require('../config');
var userRepo = require('../repositories/user-repository');

var secrets = config.security;
if (!secrets || !secrets["jwt-secret"] || !secrets.passphrase)
  throw new Error("Security secrets must not be blank.");

function unauthorized(next){
  var error = new Error("Authentication Failed");
  error.status = 401;
  if (next)
    next(error);
  else
    throw error;
}

function getPasswordHash(password) {
  return CryptoJS.HmacSHA1(password, secrets.passphrase);
}

/**
 * Given a principal, set it to the request object, then
 * compute a JWT token based on the principal and add it
 * to the X-Jwt-Token header.
 */
function authenticated(principal,req,res){
  req.principal = principal;
  var jwtToken = jwt.sign({"_id":principal._id}, secrets["jwt-secret"], {
    expiresInMinutes: 20
  });
  console.log(jwtToken);
  res.set('X-Jwt-Token',jwtToken);
}

/**
 * Check the request for an "Authorization" header. If
 * the header is present, check whether the authentication
 * method is HTTP Basic or JWT. If HTTP Basic, get the
 * entity from DB and compare the password hashes. If
 * JWT, verify that the token is valid. If successful,
 * add the authenticated entity to the request and add
 * a new JWT token to the response.
 */

module.exports.getPasswordHash = function(password){
  return getPasswordHash(password).toString();
};

// mark the principal object passed in as authenticated and set the proper response headers
module.exports.authenticated = function(principal,req,res){
  authenticated(principal,req,res);
};

// authentication method is HTTP Basic
module.exports.basic = function(req,res,next){
  var header = req.headers['authorization'];
  if (!header) {
    unauthorized(next);
    return;
  }

  var tokens = /^Basic\s(.+)/i.exec(header);
  if (!tokens || tokens.length < 2) {
    unauthorized(next);
    return;
  }

  var arrToken = new Buffer(tokens[1],'base64').toString('utf8').split(':');

  userRepo.findOne({"email": arrToken[0]}).then(function(user){
    // If the password in the header matches hash stored in DB, allow access.
    if (getPasswordHash(arrToken[1]) == user.getPasswordHash()) {
      authenticated(user,req,res);
      next();
    } else {
      unauthorized(next);
    }
  }).catch(function(error){
    console.log(error);
    unauthorized(next);
  });
};

// authentication method is JWT
module.exports.jwt = function(req,res,next){
  var header = req.headers['authorization'];
  if (!header) {
    unauthorized(next);
    return;
  }

  var tokens = /^JWT\s(.+)/i.exec(header);
  if (!tokens || tokens.length < 2) {
    unauthorized(next);
    return;
  }

  jwt.verify(tokens[1], secrets["jwt-secret"], function(err, decoded) {
    if (err) {
      console.log(err);
      unauthorized(next);
    } else {
      // decoded object should be an ID
      userRepo.findOne({"_id": decoded._id}).then(function(user){
        authenticated(user,req,res);
        next();
      }).catch(function(error){
        unauthorized(next);
      });
    }
  });
};
