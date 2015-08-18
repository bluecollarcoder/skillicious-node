var express = require('express');
var router = express.Router();
var User = require('../models/user');
var UserRepo = require('../repositories/user-repository');

router.use(require('../middleware/auth'));

router.route('/').get(function getAllCandidates(req,res,next){
  UserRepo.find({"role":"candidate"}).then(function(candidates){
    res.send(candidates);
  }).catch(function(error){
    console.log(error);
    res.render('error',{"error":error,"message":"Error retrieving candidates"});
  });
}).post(function createCandidate(req,res,next){
  var candidate = new User.Candidate(req.body);
  console.log(candidate);
  UserRepo.insert(candidate).then(function(){
    res.send(candidate);
  }).catch(function(error){
    console.log(error);
    res.render('error',{"error":error,"message":"Error inserting candidate"});
  });
});

module.exports = router;
