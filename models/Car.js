const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Economy', 'Sedan', 'SUV', 'Luxury'],
    required: [true, 'Category is required']
  },
  image: {
    type: String,
    required: [true, 'Car image URL is required']
  },
  rentPerDay: {
    type: Number,
    required: [true, 'Rent per day is required'],
    min: 0
  },
  available: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  seats: {
    type: Number,
    default: 5
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    default: 'Manual'
  },
  fuel: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
    default: 'Petrol'
  },
  features: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Car', carSchema);
