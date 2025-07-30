const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user (password will be hashed later when we add bcrypt)
    const user = new User({
      name,
      email,
      password // For now, store as plain text (we'll add bcrypt later)
    });

    const savedUser = await user.save();
    
    // Don't send password back
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      createdAt: savedUser.createdAt
    };

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password (for now, direct comparison - we'll add bcrypt later)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Don't send password back
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user (for testing)
router.get('/me', async (req, res) => {
  try {
    // For now, just return a mock user
    // Later we'll add JWT middleware to get the actual user
    res.json({ message: 'Authentication middleware will be added later' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 