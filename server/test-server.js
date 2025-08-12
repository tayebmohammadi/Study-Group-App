const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage for testing
let users = [];
let groups = [];

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    _id: Date.now().toString(),
    name,
    email,
    password,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.json(userWithoutPassword);
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Get all groups
app.get('/api/groups', (req, res) => {
  res.json(groups);
});

// Get groups for specific user
app.get('/api/groups/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  const userGroups = groups.map(group => {
    const isOwner = group.ownerId === userId;
    const isMember = group.members.some(m => m.userId === userId);
    const isFavorited = group.favorites && group.favorites.includes(userId);
    
    return {
      ...group,
      userStatus: {
        isOwner,
        isMember,
        isFavorited: isFavorited || false,
        hasRequested: false,
        isWaitlisted: false
      }
    };
  });
  
  res.json(userGroups);
});

// Create group
app.post('/api/groups', (req, res) => {
  const groupData = req.body;
  
  const newGroup = {
    _id: Date.now().toString(),
    ...groupData,
    members: [],
    pendingMembers: [],
    waitlist: [],
    favorites: [],
    createdAt: new Date()
  };
  
  groups.push(newGroup);
  res.json(newGroup);
});

// Join group
app.post('/api/groups/:groupId/join', (req, res) => {
  const { groupId } = req.params;
  const { userId, name, email } = req.body;
  
  const group = groups.find(g => g._id === groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }
  
  if (group.privacy === 'public') {
    // Add to members directly
    group.members.push({ userId, name, email, joinedAt: new Date() });
  } else {
    // Add to pending members
    group.pendingMembers.push({ userId, name, email, requestedAt: new Date() });
  }
  
  res.json({ message: group.privacy === 'public' ? 'Successfully joined group' : 'Request sent to join group', group });
});

// Toggle favorite
app.post('/api/groups/:groupId/favorite', (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  
  const group = groups.find(g => g._id === groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }
  
  if (!group.favorites) {
    group.favorites = [];
  }
  
  const isFavorited = group.favorites.includes(userId);
  if (isFavorited) {
    group.favorites = group.favorites.filter(id => id !== userId);
  } else {
    group.favorites.push(userId);
  }
  
  res.json({ message: isFavorited ? 'Removed from favorites' : 'Added to favorites' });
});

// Add some sample groups
const sampleGroups = [
  {
    _id: '1',
    name: 'Calculus Study Group',
    topic: 'Mathematics',
    description: 'Join us for calculus study sessions!',
    capacity: 8,
    privacy: 'public',
    meetingType: 'in-person',
    meetingDate: '2024-12-20',
    meetingTime: '14:00',
    meetingLocation: 'Baker Library',
    meetingRoom: 'Room 101',
    meetingDuration: 90,
    ownerId: 'sample-owner',
    ownerName: 'Alex Chen',
    ownerEmail: 'alex@dartmouth.edu',
    members: [],
    pendingMembers: [],
    waitlist: [],
    favorites: [],
    createdAt: new Date()
  },
  {
    _id: '2',
    name: 'Computer Science Club',
    topic: 'Programming',
    description: 'Learn programming together!',
    capacity: 10,
    privacy: 'public',
    meetingType: 'hybrid',
    meetingDate: '2024-12-21',
    meetingTime: '15:30',
    meetingLocation: 'Sudikoff Lab',
    meetingRoom: 'Lab 204',
    meetingUrl: 'https://zoom.us/j/123456789',
    meetingDuration: 120,
    ownerId: 'sample-owner-2',
    ownerName: 'Sarah Kim',
    ownerEmail: 'sarah@dartmouth.edu',
    members: [],
    pendingMembers: [],
    waitlist: [],
    favorites: [],
    createdAt: new Date()
  }
];

groups = sampleGroups;

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Sample groups created!');
});
