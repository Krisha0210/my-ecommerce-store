const { v4: uuidv4 } = require('uuid');
const dbDriver = require('../config/db');

exports.addProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    const numericRating = parseInt(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    // 1. Fetch product
    const product = await dbDriver.products.getById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // 2. Fetch logged-in user profile to get their name
    const user = await dbDriver.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // 3. Create review object
    const newReview = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      rating: numericRating,
      comment,
      createdAt: new Date().toISOString()
    };

    // 4. Update product reviews and recalculate average rating
    const reviews = Array.isArray(product.reviews) ? [...product.reviews] : [];
    reviews.push(newReview);

    const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = parseFloat((totalRatingSum / reviews.length).toFixed(1));

    const updatedProduct = await dbDriver.products.update(productId, {
      reviews,
      rating: averageRating
    });

    res.status(201).json({
      message: 'Product review submitted successfully.',
      review: newReview,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Add product review error:', error);
    res.status(500).json({ message: 'Server error adding product review.' });
  }
};

exports.getWebsiteReviews = async (req, res) => {
  try {
    const reviews = await dbDriver.websiteReviews.getAll();
    res.json(reviews);
  } catch (error) {
    console.error('Get website reviews error:', error);
    res.status(500).json({ message: 'Server error retrieving website reviews.' });
  }
};

exports.addWebsiteReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    const numericRating = parseInt(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    // Fetch user to get name
    const user = await dbDriver.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    const newReview = {
      id: uuidv4(),
      userName: user.name,
      rating: numericRating,
      comment,
      createdAt: new Date().toISOString()
    };

    const review = await dbDriver.websiteReviews.create(newReview);
    res.status(201).json({
      message: 'Website review submitted successfully.',
      review
    });
  } catch (error) {
    console.error('Add website review error:', error);
    res.status(500).json({ message: 'Server error adding website review.' });
  }
};
