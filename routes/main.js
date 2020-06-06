var express = require('express');
var router = express.Router();

var mainController = require('../controller/mainController');

router.get('/', mainController.index);
router.get('/announcement', mainController.announcement);
router.get('/tv', mainController.tv);
router.get('/admin', mainController.admin);

router.get('/logout', mainController.logout);
router.post('/login', mainController.login);
module.exports = router;
