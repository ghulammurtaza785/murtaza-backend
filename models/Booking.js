const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  days: {
    type: Number,
    required: [true, 'Number of days is required'],
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'gmail', 'whatsapp'],
    default: 'cash'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String
});

// Calculate endDate before saving
bookingSchema.pre('save', function(next) {
  if (this.startDate && this.days) {
    this.endDate = new Date(this.startDate.getTime() + this.days * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
