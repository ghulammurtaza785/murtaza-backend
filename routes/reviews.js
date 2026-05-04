const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Car = require('../models/Car');
const { protect } = require('../middleware/auth');

// Get all reviews (public)
router.get('/', async (req, res) => {
  try {
    const { carId } = req.query;
    let filter = {};
    if (carId) filter.carId = carId;

    const reviews = await Review.find(filter)
      .populate('userId', 'name')
      .populate('carId', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add review (authenticated)
router.post('/', protect, async (req, res) => {
  try {
    const { carId, rating, comment } = req.body;

    const review = await Review.create({
      userId: req.user._id,
      carId: carId || null,
      rating,
      comment
    });

    // Update car rating if carId provided
    if (carId) {
      const reviews = await Review.find({ carId });
      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      await Car.findByIdAndUpdate(carId, {
        rating: Math.round(avgRating * 10) / 10,
        totalRatings: reviews.length
      });
    }

    const populated = await Review.findById(review._id)
      .populate('userId', 'name')
      .populate('carId', 'name');

    res.status(201).json({ success: true, review: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
