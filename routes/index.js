var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('Handling root route request');
  return res.redirect('/admin/signin')
});

module.exports = router;