const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const carRoutes       = require('./routes/cars');
const bookingRoutes   = require('./routes/bookings');
const reviewRoutes    = require('./routes/reviews');
const complaintRoutes = require('./routes/complaints');
const adminRoutes     = require('./routes/admin');
const blogRoutes      = require('./routes/blogs');

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://murtaza-rentacar.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/cars',       carRoutes);
app.use('/api/bookings',   bookingRoutes);
app.use('/api/reviews',    reviewRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/blogs',      blogRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Murtaza Rent A Car API is running' });
});

// ── MongoDB Connection (Railway-compatible) ───────────────
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS:          45000,
  connectTimeoutMS:         30000,
  maxPoolSize:              10,
  family:                   4,     // Force IPv4 — fixes Railway DNS/SRV issue
};

const connectDB = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
      console.log('Connected to MongoDB Atlas');
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, '0.0.0.0', () => {
        console.log('Server running on port ' + PORT);
      });
      return;
    } catch (err) {
      retries--;
      console.error('MongoDB error (' + retries + ' retries left): ' + err.message);
      if (retries === 0) {
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  }
};

connectDB();

module.exports = app;
