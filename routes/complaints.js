const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Complaint = require('../models/Complaint');
const { protect, adminOnly } = require('../middleware/auth');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Submit complaint (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const complaint = await Complaint.create({ name, email, message });

    // Send email to admin
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Complaint/Contact from ${name} - Murtaza Rent A Car`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">New Complaint Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px;">
              ${message}
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
              This complaint was submitted via Murtaza Rent A Car website.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
      // Don't fail the complaint creation if email fails
    }

    res.status(201).json({ success: true, message: 'Your message has been sent successfully!', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all complaints (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ date: -1 });
    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update complaint status (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
