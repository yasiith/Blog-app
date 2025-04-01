import express from 'express';
import bcrypt from 'bcryptjs'; // Ensure you're using bcryptjs
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Correct the path to User model
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
  const { username, email, password,} = req.body;

  // Check if all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // Check if the email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong, please try again later' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if both fields are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong, please try again later' });
  }
});

// Export the router
export default router;

