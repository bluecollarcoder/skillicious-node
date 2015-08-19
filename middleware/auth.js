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
  else {
    throw error;
  }
}

/**
 * Given a principal, set it to the request object, then
 * compute a JWT token based on the principal and add it
 * to the X-Jwt-Token header.
 */
function authenticated(principal,req,res,next){
  req.principal = principal;
  var jwtToken = jwt.sign(_.extend({}, principal), secrets["jwt-secret"], {
    expiresInMinutes: 20
  });
  console.log(jwtToken);
  res.set('X-Jwt-Token',jwtToken);
  next();
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
module.exports = function(req,res,next){
  var header = req.headers['authorization'];
  if (!header) {
    unauthorized(next);
    return;
  }

  var tokens = /^(Basic|JWT)\s(.+)/i.exec(header);
  if (!tokens || tokens.length < 3) {
    unauthorized(next);
    return;
  }

  switch (tokens[1].toLowerCase()) {
    case "basic":
      // authentication method is HTTP Basic
      var arrToken = new Buffer(tokens[2],'base64').toString('utf8').split(':');
      userRepo.findOne({"name": arrToken[0]}).then(function(user){
        // hash the password from authorization header
        var expected = CryptoJS.HmacSHA1(arrToken[1], secrets.passphrase);

        // If the password in the header matches hash stored in DB, allow access.
        if (expected == user.getPasswordHash()) {
          authenticated(user,req,res,next);
        } else {
          unauthorized(next);
        }
      }).catch(function(error){
        console.log(error);
        unauthorized(next);
      });
      break;
    case "jwt":
      // authentication method is JWT
      jwt.verify(tokens[2], secrets["jwt-secret"], function(err, decoded) {
        if (err) {
          console.log(err);
          unauthorized(next);
        } else {
          // decoded object should be a candidate
          userRepo.findOne({"_id": decoded._id}).then(function(user){
            authenticated(user,req,res,next);
          }).catch(function(error){
            unauthorized(next);
          });
        }
      });
      break;
    default:
      // Impossible
      throw new Error("Unsupported authentication method");
  }
};
