var Assert = require('chai').assert;
var sinon = require('sinon');
var _ = require('underscore');
var RSVP = require('rsvp');
var express = require('express');
var request = express.request;
var response = express.response;
var User = require('../models/user.js');
var userRepo = require('../repositories/user-repository');
var auth = require('../middleware/auth.js');

describe('Auth Middleware',function(){

  var repo;
  before(function(){
    var repo = sinon.stub(userRepo,"getByName");
    repo.withArgs("wayne").returns(new RSVP.Promise(function(resolve,reject){
      resolve(new User.Candidate({
        "_id" : "55cf6370b5cb227ff184884c",
        "name" : "wayne",
        "first" : "Wayne",
        "last" : "Chan",
        "pwdHash" : "a1a51e8206274278d4ba1ac5095bdbb4411266b7"
      }));
    }));
    repo.withArgs().returns(new RSVP.Promise(function(resolve,reject){
      reject(new Error("Candidate not found"));
    }));
  });

  var res;
  beforeEach(function(){
    res = _.extend({},response);
  });

  it('send 401 for request w/o header',function(done){
    auth({"headers":{}},res,function(){
      Assert.equal(arguments.length,1);
      Assert.equal(arguments[0].status,401);
      done();
    });
  });

  it('send 401 for invalid header',function(done){
    new RSVP.Promise(function(resolve,reject){
      auth({"headers":{
        "authorization":"1234"
      }},res,function(){
        Assert.equal(arguments.length,1);
        Assert.equal(arguments[0].status,401);
        resolve();
      });
    }).then(function(){
      done();
    }).catch(done);
  });

  it('send 401 for invalid "Basic Auth" header',function(done){
    new RSVP.Promise(function(resolve,reject){
      auth({"headers":{
        "authorization":"Basic 1234"
      }},res,function(){
        Assert.equal(arguments.length,1);
        Assert.equal(arguments[0].status,401);
        resolve();
      });
    }).then(function(){
      return new RSVP.Promise(function(resolve,reject){
        auth({"headers":{
          "authorization":"Basic MTIzNA==" // 1234
        }},res,function(){
          Assert.equal(arguments.length,1);
          Assert.equal(arguments[0].status,401);
          resolve();
        });
      });
    }).then(function(){
      return new RSVP.Promise(function(resolve,reject){
        auth({"headers":{
          "authorization":"Basic d2F5bmU=" // wayne
        }},res,function(){
          Assert.equal(arguments.length,1);
          Assert.equal(arguments[0].status,401);
          resolve();
        });
      });
    }).then(function(){
      return new RSVP.Promise(function(resolve,reject){
        auth({"headers":{
          "authorization":"Basic d2F5bmU6MTIzNA==" // wayne:1234
        }},res,function(){
          Assert.equal(arguments.length,1);
          Assert.equal(arguments[0].status,401);
          resolve();
        });
      });
    }).then(function(){
      done();
    }).catch(done);
  });

  it('send JWT for valid "Basic Auth" header',function(done){
    new RSVP.Promise(function(resolve,reject){
      auth({"headers":{
        "authorization":"Basic d2F5bmU6cGFzczEyMzQ=" // wayne:pass1234
      }},res,function(){
        Assert.equal(arguments.length,0);
        resolve();
      });
    }).then(function(){
      Assert.isNotNull(res.get('X-Jwt-Token'));
      done();
    }).catch(done);
  });

  it('send JWT for valid "Basic Auth" header',function(done){
    new RSVP.Promise(function(resolve,reject){
      auth({"headers":{
        "authorization":"BASIC d2F5bmU6cGFzczEyMzQ=" // wayne:pass1234
      }},res,function(){
        Assert.equal(arguments.length,0);
        resolve();
      });
    }).then(function(){
      Assert.isNotNull(res.get('X-Jwt-Token'));
      done();
    }).catch(done);
  });

});
