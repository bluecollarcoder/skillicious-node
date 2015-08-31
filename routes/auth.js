var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');

router.route('/').get(auth.basic);
router.route('/').get(function(req,res,next){
  res.send(req.principal);
});

module.exports = router;
