const mongoose = require('mongoose');

// Define the structure of a Study Group
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
  },
  members: [{
    name: String,
    email: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mode: {
    type: String,
    enum: ['quiet', 'collaborative'],
    default: 'collaborative'
  },
  sessions: [{
    date: Date,
    location: String,
    agenda: String,
    attendees: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
groupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the Group model
module.exports = mongoose.model('Group', groupSchema);
