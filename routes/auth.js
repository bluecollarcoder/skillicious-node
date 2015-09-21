var express = require('express');
var router = express.Router();
var _ = require('underscore');
var auth = require('../middleware/auth');
var User = require('../models/user');
var Employer = require('../models/employer');
var UserRepository = require('../repositories/user-repository');
var EmployerRepository = require('../repositories/employer-repository');

// User sign in
router.route('/').get(auth.basic);
router.route('/').get(function(req,res,next){
  res.send(req.principal);
});

function badRequest(message){
  var error = new Error("Please complete the registration form.");
  error.status = 400;
  return error;
}

// Registering new user
router.route('/').post(function(req,res,next){
  var opt = _.extend({},req.body);
  var error;

  if (!opt.name || !opt.email || !opt.password) {
    error = badRequest("Please complete the registration form.");
    next(error);
    return;
  }

  opt.pwdHash = auth.getPasswordHash(opt.password);
  var user = new User.GenericUser(opt);

  if (opt.role == 'employer') {
    // Check the employer information too
    if (!opt.company) {
      error = badRequest("Please complete the registration form.");
      next(error);
      return;
    }
    // Create new employer
    user = new User.Recruiter(opt);
    var employer = new Employer(opt.company);
    EmployerRepository.insert(employer,user).then(function(result){
      auth.authenticated(user,req,res);
      res.send(user);
    }).catch(function(error){
      if (error instanceof EmployerRepository.errors.DuplicateEmailError || error instanceof EmployerRepository.errors.DuplicateNameError)
        error.status = 400;
      next(error);
    });
  } else {
    // Create new candidate
    UserRepository.insert(user).then(function(){
      auth.authenticated(user,req,res);
      res.send(user);
    }).catch(function(error){
      if (error instanceof UserRepository.errors.DuplicateEmailError)
        error.status = 400;
      next(error);
    });
  }
});

module.exports = router;
