const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const Review = require('../models/Review');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Admin dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalCars = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ available: true });
    const carsOnRent = await Car.countDocuments({ available: false });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const activeBookings = await Booking.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const newComplaints = await Complaint.countDocuments({ status: 'new' });

    // Monthly earnings (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyBookings = await Booking.find({
      date: { $gte: startOfMonth },
      status: { $in: ['confirmed', 'active', 'completed'] }
    });
    const monthlyEarnings = monthlyBookings.reduce((acc, b) => acc + b.totalPrice, 0);

    // Total earnings
    const allConfirmedBookings = await Booking.find({
      status: { $in: ['confirmed', 'active', 'completed'] }
    });
    const totalEarnings = allConfirmedBookings.reduce((acc, b) => acc + b.totalPrice, 0);

    // Monthly earnings breakdown (last 6 months)
    const monthlyBreakdown = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const bookings = await Booking.find({
        date: { $gte: start, $lte: end },
        status: { $in: ['confirmed', 'active', 'completed'] }
      });
      
      const earnings = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
      monthlyBreakdown.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        earnings,
        bookings: bookings.length
      });
    }

    res.json({
      success: true,
      stats: {
        totalCars,
        availableCars,
        carsOnRent,
        totalBookings,
        pendingBookings,
        activeBookings,
        totalUsers,
        newComplaints,
        monthlyEarnings,
        totalEarnings,
        monthlyBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
