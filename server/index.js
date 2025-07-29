// Import required libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware - these process requests before they reach your routes
app.use(cors()); // Allows your React frontend to talk to this server
app.use(express.json()); // Parses JSON data from requests

// Connect to MongoDB database
mongoose.connect('mongodb+srv://tayebmohammadi26:DALILab%40dartmouth123@cluster0.azmx8gv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('Connected to MongoDB Atlas!'))
.catch(err => {
  console.log('MongoDB connection error:', err);
  console.log('To use MongoDB, install it with: brew install mongodb-community');
});

// Basic route to test if server is working
app.get('/', (req, res) => {
  res.json({ message: 'Study Groups API is running!' });
});

// Import and use routes
const groupRoutes = require('./routes/groups');
app.use('/api/groups', groupRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
