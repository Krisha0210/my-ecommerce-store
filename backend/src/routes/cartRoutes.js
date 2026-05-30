const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, cartController.getCart);
router.put('/', verifyToken, cartController.updateCart);

module.exports = router;
