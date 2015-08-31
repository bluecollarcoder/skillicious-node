var express = require('express');
var router = express.Router();
var User = require('../models/user');
var CandidateProfile = require('../models/profile').CandidateProfile;
var UserRepo = require('../repositories/user-repository');
var ProfileRepo = require('../repositories/profile-repository');

router.use(require('../middleware/auth').jwt);

router.param('user_id',function(req,res,next,id){
  console.log("id="+id);
  next();
});

router.route('/').get(function getProfile(req,res,next){
  var me = req.principal;
  ProfileRepo.findOne(me._id).then(function(profile){
    res.send(profile);
  }).catch(function(error){
    console.log(error);
    res.render('error',{"error":error,"message":"Error updating user profile"});
  });
});

router.route('/:user_id').get(function getProfileById(req,res,next){
  console.log("Get profile by ID");
});

router.route('/profile').put(function updateProfile(req,res,next){
  var me = req.principal;
  console.log(req.body);
  var profile;
  switch (me.role) {
    case 'candidate':
      profile = new CandidateProfile(typeof req.body == 'string' ? JSON.parse(req.body) : req.body);
      break;
    default:
      throw new Error('Not yet supported.');
  }
  console.log(profile);
  me.profile = profile;

  ProfileRepo.updateOne(me).then(function(updated){
    res.send(updated);
  }).catch(function(error){
    console.log(error);
    res.render('error',{"error":error,"message":"Error updating user profile"});
  });
});

module.exports = router;
