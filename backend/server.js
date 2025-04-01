import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';
import connectDB from './lib/db.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Route for generating signature (needed for signed uploads)
app.get('/api/cloudinary/sign', (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
  };
  
  // Create the signature string
  const stringToSign = `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha256').update(stringToSign).digest('hex');

  res.json({
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
