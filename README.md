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

## 📚 Learning Journey & Challenges

### Initial Setup Challenges
1. **Node.js Installation**: Faced `npm: command not found` error
   - **Solution**: Used `nvm` to install Node.js v18
   - **Learning**: Understanding package managers and version control

2. **MongoDB Connection**: Initial local MongoDB setup failed
   - **Solution**: Pivoted to MongoDB Atlas cloud database
   - **Challenge**: URL encoding issues with special characters in password
   - **Fix**: Encoded `@` symbol as `%40` in connection string

3. **Port Conflicts**: Apple's AirPlay service using port 5000
   - **Solution**: Changed backend port to 3001
   - **Learning**: Understanding port management and service conflicts

### Development Challenges & Solutions

#### 1. User Authentication System
- **Challenge**: Password validation requirements
- **Solution**: Implemented custom validation (8+ chars, uppercase, lowercase, number, special char)
- **Learning**: Security best practices and form validation

#### 2. Group Creation & Data Persistence
- **Challenge**: Groups not saving properly, missing meeting data
- **Solution**: Implemented POST-then-PUT workaround for reliable data saving
- **Learning**: Understanding async operations and database transactions

#### 3. UI/UX Iterations
- **Challenge**: Complex date/time picker causing layout issues
- **Solution**: Reverted to native HTML inputs with custom styling
- **Learning**: Balancing functionality with user experience

#### 4. State Management & Data Flow
- **Challenge**: Page infinite reloading and data persistence issues
- **Solution**: Removed `useCallback` dependencies, implemented proper state management
- **Learning**: React hooks, useEffect dependencies, and state synchronization

#### 5. Form Validation & User Experience
- **Challenge**: Browser validation blocking user interaction
- **Solution**: Implemented client-side validation with custom error messages
- **Learning**: Form handling and user experience optimization

#### 6. Data Consistency
- **Challenge**: Inconsistent group display between test and user-created groups
- **Solution**: Comprehensive data validation and default value handling
- **Learning**: Data integrity and consistency patterns

### Key Technical Learnings

1. **Full-Stack Development**: Understanding frontend-backend communication
2. **Database Design**: MongoDB schema design and relationships
3. **API Development**: RESTful API design and error handling
4. **State Management**: React state patterns and data flow
5. **User Experience**: Iterative design and user feedback integration
6. **Debugging**: Systematic problem-solving with console logs and testing
7. **Version Control**: Git workflow and commit management

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