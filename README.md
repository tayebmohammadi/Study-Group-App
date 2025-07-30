# Study Group App - DALI Choose Your Own Adventure Challenge

A full-stack web application for creating and managing study groups at Dartmouth College. Built with React.js frontend and Node.js/Express backend with MongoDB Atlas database.

## 🚀 Features

### Core Functionality
- **User Authentication**: Registration and login with secure password validation
- **Group Management**: Create, edit, delete, and join study groups
- **Smart Capacity System**: Automatic waitlist management when groups are full
- **Ownership Transfer**: Automatic ownership transfer when group owners leave
- **Favorites System**: Star and organize favorite groups
- **Meeting Details**: Comprehensive meeting information (date, time, location, type)
- **Privacy Controls**: Public and private group options

### Advanced Features
- **Dynamic Notifications**: User-friendly disappearing notification system
- **Tabbed Interface**: Separate views for "My Groups", "Available Groups", and "Favorites"
- **Meeting Privacy**: Room numbers and URLs only visible to group members
- **Dartmouth Library Integration**: Direct links to library room reservation
- **Form Validation**: Comprehensive client-side validation for all required fields
- **Responsive Design**: Modern, clean UI with professional styling

## 🛠️ Tech Stack

### Frontend
- **React.js**: Modern UI framework
- **Axios**: HTTP client for API communication
- **CSS3**: Custom styling with modern design patterns
- **Local Storage**: Client-side session persistence

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB Atlas**: Cloud database
- **Mongoose**: MongoDB ODM
- **CORS**: Cross-origin resource sharing

## 📁 Project Structure

```
DALI Project/
├── client/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   └── App.css         # Styling
├── server/
│   ├── index.js            # Server entry point
│   ├── models/
│   │   ├── Group.js        # Group schema
│   │   └── User.js         # User schema
│   └── routes/
│       ├── auth.js         # Authentication routes
│       └── groups.js       # Group management routes
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- MongoDB Atlas account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tayebmohammadi/Study-Group-App.git
   cd Study-Group-App
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Set up MongoDB Atlas**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Replace the connection string in `server/index.js`

4. **Start the application**
   ```bash
   # Start backend server (from server directory)
   cd server
   node index.js
   # Server runs on http://localhost:3001

   # Start frontend (from client directory)
   cd client
   npm start
   # App runs on http://localhost:3000
   ```

## 📚 My Learning Journey

### Getting Started - The Initial Hurdles

When I first started this project, I had no experience with web development. The first challenge was simply getting Node.js installed on my Mac. I kept getting `npm: command not found` errors, which was frustrating. After some research, I discovered `nvm` (Node Version Manager) and was able to install Node.js v18. This taught me the importance of understanding package managers and version control.

Next, I tried to set up a local MongoDB database, but that didn't work out. I decided to pivot to MongoDB Atlas (a cloud database) instead. This was actually a better choice because it's more reliable and accessible. However, I ran into an issue with special characters in my password - the `@` symbol was causing problems. I learned about URL encoding and fixed it by changing `@` to `%40` in the connection string.

Then I hit another roadblock: when I tried to start my server on port 5000, it wouldn't work because Apple's AirPlay service was already using that port. I simply changed my backend to use port 3001 instead, and that solved the problem. This taught me about port management and how different services can conflict with each other.

### Building the Core Features

#### User Authentication - My First Real Challenge
I wanted users to be able to register and login securely. The biggest challenge was password validation - I needed to make sure passwords were strong enough. I implemented a custom validation system that requires at least 8 characters, including uppercase, lowercase, numbers, and special characters. This was my first experience with security best practices.

#### Group Creation - The Data Persistence Puzzle
This was probably the most frustrating part of the project. I would create groups, but they wouldn't save properly, especially the meeting details like date, time, and location. I spent a lot of time debugging this issue. Eventually, I figured out that the backend POST route wasn't reliably saving the meeting data, so I implemented a workaround: first create the basic group with POST, then immediately update it with PUT to add the meeting details. This taught me about async operations and database transactions.

#### UI/UX - Learning to Listen to User Feedback
I initially tried to build a complex date/time picker with custom scrolling components, but it was causing layout issues and was hard to use. After several iterations and user feedback, I decided to revert to native HTML inputs with custom styling. This was much simpler and actually worked better. I learned that sometimes the simplest solution is the best one.

#### State Management - The Infinite Loop Problem
I had a major issue where the page kept reloading infinitely. This was caused by improper use of React hooks and dependencies. I was using `useCallback` incorrectly, which was causing the component to re-render constantly. I fixed this by removing the `useCallback` and implementing proper state management. This taught me a lot about React hooks and how to manage state effectively.

#### Form Validation - Making It User-Friendly
I wanted all form fields to be required, but the browser's built-in validation was blocking users from interacting with the form properly. I implemented my own client-side validation with custom error messages that were more user-friendly. This was a great learning experience in form handling and user experience design.

#### Data Consistency - Making Everything Work Together
I noticed that groups I created manually didn't display the same way as the test groups I had created. Some groups were missing meeting details, which made them look incomplete. I implemented comprehensive data validation and default value handling to ensure all groups display consistently. This taught me about data integrity and consistency patterns.

### What I Learned Along the Way

1. **Full-Stack Development**: I now understand how frontend and backend communicate with each other
2. **Database Design**: I learned how to design MongoDB schemas and manage relationships between data
3. **API Development**: I can now create RESTful APIs and handle errors properly
4. **State Management**: I understand React state patterns and data flow
5. **User Experience**: I learned to iterate based on user feedback and make design decisions
6. **Debugging**: I developed systematic problem-solving skills using console logs and testing
7. **Version Control**: I became comfortable with Git workflow and commit management

The most valuable lesson was learning to be patient and systematic when debugging. Every problem had a solution, and each challenge taught me something new about web development.

## 🎯 Key Features Implemented

### Authentication & User Management
- Secure user registration with password validation
- Login/logout functionality
- Session persistence using localStorage

### Group Management System
- Create groups with comprehensive meeting details
- Join/leave groups with capacity management
- Edit and delete group functionality
- Public/private group options

### Advanced Group Features
- Waitlist system for full groups
- Automatic ownership transfer
- Favorites system with star functionality
- Meeting details privacy (room/URL for members only)

### User Interface
- Tabbed navigation (My Groups, Available Groups, Favorites)
- Dynamic notifications
- Responsive design
- Professional styling

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group
- `POST /api/groups/:id/favorite` - Toggle favorite
- `GET /api/groups/user/:userId` - Get user-specific groups

## 🎨 UI/UX Highlights

- **Clean, Modern Design**: Professional styling with consistent color scheme
- **Intuitive Navigation**: Tabbed interface for easy group management
- **Responsive Layout**: Works on desktop and mobile devices
- **Interactive Elements**: Hover effects, animations, and visual feedback
- **Accessibility**: Clear labels, proper contrast, and keyboard navigation

## 🚀 Deployment Ready

The application is ready for deployment on platforms like:
- **Frontend**: Netlify, Vercel, or GitHub Pages
- **Backend**: Render, Heroku, or Railway
- **Database**: MongoDB Atlas (already configured)

## 📝 Future Enhancements

- Real-time notifications using WebSockets
- Calendar integration for meeting scheduling
- File sharing within groups
- Advanced search and filtering
- Mobile app development
- Integration with Dartmouth's course catalog

## 🤝 Contributing

This project was built as part of the DALI Lab "Choose Your Own Adventure Challenge" at Dartmouth College. The learning journey documented here showcases the iterative development process and problem-solving skills developed throughout the project.

## 📄 License

This project is part of the DALI Lab educational initiative at Dartmouth College.

---

**Built with ❤️ for the Dartmouth community** 