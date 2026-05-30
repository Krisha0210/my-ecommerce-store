const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const verifyToken = require('../middleware/auth');

// Product Review Route (Requires Auth)
router.post('/product/:productId', verifyToken, reviewController.addProductReview);

// Website Reviews Routes (GET is public, POST requires Auth)
router.get('/website', reviewController.getWebsiteReviews);
router.post('/website', verifyToken, reviewController.addWebsiteReview);

module.exports = router;
