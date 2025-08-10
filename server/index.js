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
const authRoutes = require('./routes/auth');

app.use('/api/groups', groupRoutes);
app.use('/api/auth', authRoutes);

// Import Group model for seeding
const Group = require('./models/Group');

// Function to create example groups
const createExampleGroups = async () => {
  try {
    // Clear any existing example groups first
    await Group.deleteMany({ 
      name: { 
        $regex: /^(Calculus Warriors|CodeCrafters|Physics Explorers|Literary Circle|Econ Masters|Chemistry Lab Squad|History Detectives|Psychology Minds|Math Olympiad Champions|Biology Explorers|Spanish Conversation Club|Art & Design Studio|Example Group)/ 
      } 
    });
    console.log('Cleared existing example groups');

    const exampleGroups = [
      {
        name: "Calculus Warriors - Derivatives & Integrals",
        topic: "Mathematics",
        description: "Join us for an intensive calculus study session! We'll tackle challenging derivatives, integrals, and their real-world applications. Perfect for Math 3 students. Bring your questions and problem-solving skills!",
        capacity: 8,
        privacy: "public",
        meetingType: "in-person",
        mode: "weekly",
        meetingDate: "2024-12-20",
        meetingTime: "14:00",
        meetingLocation: "Baker Library",
        meetingRoom: "Room 101",
        meetingDuration: 90,
        ownerId: "example-owner-1",
        ownerName: "Alex Chen",
        ownerEmail: "alex.chen@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "CodeCrafters - Algorithms & Data Structures",
        topic: "Computer Science",
        description: "Master the fundamentals of programming! We'll dive deep into algorithms, data structures, and problem-solving techniques. Great for CS1 and CS10 students. Let's build amazing things together!",
        capacity: 6,
        privacy: "public",
        meetingType: "hybrid",
        mode: "weekly",
        meetingDate: "2024-12-21",
        meetingTime: "15:30",
        meetingLocation: "Sudikoff Laboratory",
        meetingRoom: "Lab 204",
        meetingUrl: "https://zoom.us/j/123456789",
        meetingDuration: 120,
        ownerId: "example-owner-2",
        ownerName: "Sarah Kim",
        ownerEmail: "sarah.kim@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "Physics Explorers - Mechanics & Thermodynamics",
        topic: "Physics",
        description: "Unlock the mysteries of the universe! Join our physics study group where we explore mechanics, thermodynamics, and problem-solving strategies. Perfect for Physics 3 and 4 students.",
        capacity: 10,
        privacy: "public",
        meetingType: "in-person",
        mode: "weekly",
        meetingDate: "2024-12-22",
        meetingTime: "16:00",
        meetingLocation: "Wilder Hall",
        meetingRoom: "Room 312",
        meetingDuration: 90,
        ownerId: "example-owner-3",
        ownerName: "Michael Rodriguez",
        ownerEmail: "michael.rodriguez@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "Literary Circle - Modern American Classics",
        topic: "Literature",
        description: "Dive into the world of contemporary American literature! We'll discuss themes, analyze writing styles, and explore the cultural impact of modern classics. All literature lovers welcome!",
        capacity: 12,
        privacy: "public",
        meetingType: "online",
        mode: "weekly",
        meetingDate: "2024-12-23",
        meetingTime: "19:00",
        meetingUrl: "https://teams.microsoft.com/l/meetup-join/123456",
        meetingDuration: 60,
        ownerId: "example-owner-4",
        ownerName: "Emma Thompson",
        ownerEmail: "emma.thompson@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "Econ Masters - Supply, Demand & Markets",
        topic: "Economics",
        description: "Master the fundamentals of microeconomics! We'll explore supply and demand, market structures, consumer behavior, and economic decision-making. Perfect for Econ 1 students.",
        capacity: 8,
        privacy: "public",
        meetingType: "in-person",
        mode: "weekly",
        meetingDate: "2024-12-24",
        meetingTime: "13:00",
        meetingLocation: "Dartmouth Hall",
        meetingRoom: "Room 105",
        meetingDuration: 90,
        ownerId: "example-owner-5",
        ownerName: "David Park",
        ownerEmail: "david.park@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "Chemistry Lab Squad - Safety & Experiments",
        topic: "Chemistry",
        description: "Get ready for your chemistry labs! We'll review safety protocols, experiment procedures, and lab techniques. Essential for Chem 5 and 6 students. Safety first!",
        capacity: 6,
        privacy: "public",
        meetingType: "in-person",
        mode: "weekly",
        meetingDate: "2024-12-25",
        meetingTime: "10:00",
        meetingLocation: "Steele Hall",
        meetingRoom: "Lab 103",
        meetingDuration: 75,
        ownerId: "example-owner-6",
        ownerName: "Lisa Wang",
        ownerEmail: "lisa.wang@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "History Detectives - Primary Sources & Research",
        topic: "History",
        description: "Become a history detective! We'll analyze primary sources, develop research skills, and explore historical methodologies. Perfect for History 3 and 4 students.",
        capacity: 10,
        privacy: "public",
        meetingType: "hybrid",
        mode: "weekly",
        meetingDate: "2024-12-26",
        meetingTime: "14:30",
        meetingLocation: "Rauner Library",
        meetingRoom: "Study Room A",
        meetingUrl: "https://zoom.us/j/987654321",
        meetingDuration: 90,
        ownerId: "example-owner-7",
        ownerName: "James Wilson",
        ownerEmail: "james.wilson@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "Psychology Minds - Cognitive Science & Behavior",
        topic: "Psychology",
        description: "Explore the fascinating world of psychology! We'll discuss cognitive processes, behavioral patterns, and psychological research methods. Great for Psych 1 students.",
        capacity: 15,
        privacy: "public",
        meetingType: "online",
        mode: "weekly",
        meetingDate: "2024-12-27",
        meetingTime: "18:00",
        meetingUrl: "https://teams.microsoft.com/l/meetup-join/456789",
        meetingDuration: 60,
        ownerId: "example-owner-8",
        ownerName: "Rachel Green",
        ownerEmail: "rachel.green@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "Math Olympiad Champions - Problem Solving",
        topic: "Mathematics",
        description: "Ready for a mathematical challenge? Join our competition prep group! We'll solve complex problems, develop strategies, and prepare for math competitions. For advanced math students.",
        capacity: 8,
        privacy: "public",
        meetingType: "in-person",
        mode: "weekly",
        meetingDate: "2024-12-28",
        meetingTime: "15:00",
        meetingLocation: "Kemeny Hall",
        meetingRoom: "Room 208",
        meetingDuration: 120,
        ownerId: "example-owner-9",
        ownerName: "Kevin Park",
        ownerEmail: "kevin.park@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "Biology Explorers - Cells & Genetics",
        topic: "Biology",
        description: "Discover the building blocks of life! We'll explore cell biology, genetics, and molecular processes. Perfect for Bio 11 and 12 students. Let's unlock the secrets of life!",
        capacity: 12,
        privacy: "public",
        meetingType: "in-person",
        mode: "weekly",
        meetingDate: "2024-12-29",
        meetingTime: "16:30",
        meetingLocation: "Life Sciences Center",
        meetingRoom: "Room 401",
        meetingDuration: 90,
        ownerId: "example-owner-10",
        ownerName: "Maria Garcia",
        ownerEmail: "maria.garcia@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "Spanish Conversation Club - ¡Hablemos Español!",
        topic: "Languages",
        description: "¡Practica tu español! Join our Spanish conversation club for immersive language practice. We'll discuss culture, current events, and everyday topics. All levels welcome!",
        capacity: 10,
        privacy: "public",
        meetingType: "hybrid",
        mode: "weekly",
        meetingDate: "2024-12-30",
        meetingTime: "17:00",
        meetingLocation: "Dartmouth Hall",
        meetingRoom: "Room 203",
        meetingUrl: "https://zoom.us/j/555666777",
        meetingDuration: 60,
        ownerId: "example-owner-11",
        ownerName: "Carlos Mendez",
        ownerEmail: "carlos.mendez@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      },
      {
        name: "Art & Design Studio - Creative Expression",
        topic: "Arts",
        description: "Unleash your creativity! Join our art and design studio where we explore various mediums, techniques, and creative processes. Perfect for Studio Art students and art enthusiasts.",
        capacity: 8,
        privacy: "public",
        meetingType: "in-person",
        mode: "weekly",
        meetingDate: "2024-12-31",
        meetingTime: "14:00",
        meetingLocation: "Hood Museum",
        meetingRoom: "Studio A",
        meetingDuration: 120,
        ownerId: "example-owner-12",
        ownerName: "Sophie Anderson",
        ownerEmail: "sophie.anderson@dartmouth.edu",
        members: [],
        waitlist: [],
        createdAt: new Date()
      }
    ];

    await Group.insertMany(exampleGroups);
    console.log('Created 10 example groups successfully!');
  } catch (error) {
    console.error('Error creating example groups:', error);
  }
};

// Create example groups after database connection
mongoose.connection.once('open', () => {
  console.log('MongoDB connection established, creating example groups...');
  createExampleGroups();
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
