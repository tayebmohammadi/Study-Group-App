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
    max: 100
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pendingMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  waitlist: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mode: {
    type: String,
    enum: ['quiet', 'collaborative'],
    default: 'collaborative'
  },
  // Meeting details
  meetingType: { type: String, enum: ['in-person', 'online', 'hybrid'], default: 'in-person' },
  meetingDate: { type: Date },
  meetingTime: { type: String },
  meetingLocation: { type: String },
  meetingRoom: { type: String },
  meetingUrl: { type: String },
  meetingDuration: { type: Number, default: 60 }, // in minutes
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
