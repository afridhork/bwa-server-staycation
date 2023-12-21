var express = require('express');
const adminController = require('../controllers/adminController')
var router = express.Router();

router.get('/', adminController.viewSignin);

module.exports = router;
