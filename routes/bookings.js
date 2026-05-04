const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { protect, adminOnly } = require('../middleware/auth');

// Create booking (authenticated users)
router.post('/', protect, async (req, res) => {
  try {
    const { carId, days, paymentMethod, notes } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (!car.available) return res.status(400).json({ success: false, message: 'Car is not available' });

    const totalPrice = car.rentPerDay * days;

    const booking = await Booking.create({
      userId: req.user._id,
      carId,
      days,
      totalPrice,
      paymentMethod: paymentMethod || 'cash',
      notes
    });

    // Mark car as unavailable
    await Car.findByIdAndUpdate(carId, { available: false });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('carId', 'name image rentPerDay category')
      .populate('userId', 'name email phone');

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('carId', 'name image rentPerDay category')
      .sort({ date: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all bookings (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('carId', 'name image rentPerDay category')
      .populate('userId', 'name email phone')
      .sort({ date: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update booking status (admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('carId').populate('userId', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // If completed or cancelled, make car available again
    if (status === 'completed' || status === 'cancelled') {
      await Car.findByIdAndUpdate(booking.carId._id, { available: true });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
