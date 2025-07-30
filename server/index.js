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
console.log('Attempting to connect to MongoDB Atlas...');
mongoose.connect('mongodb+srv://tayebmohammadi26:DALILab%40dartmouth123@cluster0.azmx8gv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  socketTimeoutMS: 45000, // 45 second timeout
})
.then(() => {
  console.log('Connected to MongoDB Atlas!');
  console.log('Database connection successful');
})
.catch(err => {
  console.log('MongoDB connection error:', err.message);
  console.log('Error details:', err);
  console.log('Please check your MongoDB Atlas connection string and network access');
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
