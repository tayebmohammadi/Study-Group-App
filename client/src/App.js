import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Advanced TimePicker Component with separate hour/minute scrolls
function AdvancedTimePicker({ value, onChange, placeholder = "Select time" }) {
  const handleTimeChange = (e) => {
    // Create a synthetic event with the name property
    const syntheticEvent = {
      target: {
        name: 'meetingTime',
        value: e.target.value
      }
    };
    onChange(syntheticEvent);
  };

  const displayValue = value ? (() => {
    const [hours, minutes] = value.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  })() : '';

  return (
    <div className="time-input-container">
      <input
        type="time"
        value={value}
        onChange={handleTimeChange}
        placeholder={placeholder}
        className="time-input"
      />
      {value && (
        <div className="time-display">
          {displayValue}
        </div>
      )}
    </div>
  );
}

// Advanced DatePicker Component
function AdvancedDatePicker({ value, onChange, placeholder = "Select date" }) {
  const handleDateChange = (e) => {
    onChange({ target: { name: 'meetingDate', value: e.target.value } });
  };

  return (
    <div className="date-picker-container">
      <input
        type="date"
        className="date-picker-input"
        value={value || ''}
        onChange={handleDateChange}
        placeholder={placeholder}
        min={new Date().toISOString().split('T')[0]} // Set minimum date to today
      />
    </div>
  );
}

function App() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-groups');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);


  const fetchGroups = async (currentUser = user) => {
    try {
      setLoading(true);
      if (currentUser) {
        const response = await axios.get(`http://localhost:3001/api/groups/user/${currentUser._id}`);
        console.log('Fetched groups with user status:', response.data); // Added debug log
        console.log('First group userStatus example:', response.data[0]?.userStatus); // Debug first group
        setGroups(response.data);
      } else {
        const response = await axios.get('http://localhost:3001/api/groups');
        console.log('Fetched all groups:', response.data); // Added debug log
        setGroups(response.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (groupId) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/groups/${groupId}/favorite`, {
        userId: user._id
      });
      
      // Refetch groups to get updated user status
      await fetchGroups(user);
      
      showNotification(response.data.message);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showNotification('Failed to update favorite');
    }
  };

  // Notification helper
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const createGroup = async (groupData) => {
    try {
      const groupWithOwner = {
        ...groupData,
        ownerId: user._id,
        ownerName: user.name,
        ownerEmail: user.email
      };
      const response = await axios.post('http://localhost:3001/api/groups', groupWithOwner);
      
      // The POST route doesn't save meeting data properly, so update it immediately
      const createdGroup = response.data;
      console.log('Group created, now updating with meeting data:', createdGroup._id);
      
      // Update the group with meeting data using PUT route (which works)
      const updateResponse = await axios.put(`http://localhost:3001/api/groups/${createdGroup._id}`, {
        meetingDate: groupData.meetingDate,
        meetingTime: groupData.meetingTime,
        meetingLocation: groupData.meetingLocation,
        meetingRoom: groupData.meetingRoom,
        meetingUrl: groupData.meetingUrl,
        meetingDuration: groupData.meetingDuration
      });
      
      // Use the updated group data
      setGroups([updateResponse.data, ...groups]);
      setActiveTab('list');
      showNotification('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      showNotification('Failed to create group');
    }
  };

  const joinGroup = async (groupId) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/groups/${groupId}/join`, {
        userId: user._id,
        name: user.name,
        email: user.email
      });
      
      // Update the groups list with the new data
      setGroups(groups.map(group => 
        group._id === groupId ? response.data.group : group
      ));
      
      showNotification(response.data.message);
    } catch (error) {
      console.error('Error joining group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to join group';
      showNotification(errorMessage);
    }
  };

  const approveRequest = async (groupId, userId) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/groups/${groupId}/approve/${userId}`);
      setGroups(groups.map(group => 
        group._id === groupId ? response.data : group
      ));
      showNotification('Request approved!');
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('Failed to approve request');
    }
  };

  const denyRequest = async (groupId, userId) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/groups/${groupId}/deny/${userId}`);
      setGroups(groups.map(group => 
        group._id === groupId ? response.data.group : group
      ));
      showNotification('Request denied');
    } catch (error) {
      console.error('Error denying request:', error);
      showNotification('Failed to deny request');
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/groups/${groupId}/leave`, {
        userId: user._id
      });
      
      if (response.data.groupDeleted) {
        // Group was deleted, remove it from the list
        setGroups(groups.filter(group => group._id !== groupId));
        showNotification(response.data.message);
      } else {
        // Group still exists, update it
        setGroups(groups.map(group => 
          group._id === groupId ? response.data.group : group
        ));
        
        let message = response.data.message;
        if (response.data.promotedUser) {
          message += ` ${response.data.promotedUser} has been promoted from the waitlist!`;
        }
        showNotification(message);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to leave group';
      showNotification(errorMessage);
    }
  };

  const updateGroup = async (groupId, updatedData) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/groups/${groupId}`, {
        ...updatedData,
        ownerId: user._id
      });
      setGroups(groups.map(group => 
        group._id === groupId ? response.data : group
      ));
      showNotification('Group updated successfully!');
    } catch (error) {
      console.error('Error updating group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update group';
      showNotification(errorMessage);
    }
  };

  const deleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:3001/api/groups/${groupId}`, {
        data: { ownerId: user._id }
      });
      setGroups(groups.filter(group => group._id !== groupId));
      showNotification('Group deleted successfully!');
    } catch (error) {
      console.error('Error deleting group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete group';
      showNotification(errorMessage);
    }
  };

  const handleLogin = async (loginData) => {
    try {
      console.log('Attempting login with:', loginData);
      setError('');
      const response = await axios.post('http://localhost:3001/api/auth/login', loginData);
      console.log('Login successful:', response.data);
      setUser(response.data);
      setShowAuth(false);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    }
  };

  const handleRegister = async (registerData) => {
    try {
      console.log('Attempting registration with:', registerData);
      setError('');
      const response = await axios.post('http://localhost:3001/api/auth/register', registerData);
      console.log('Registration successful:', response.data);
      setUser(response.data);
      setShowAuth(false);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleShowAuth = () => {
    console.log('Login/Register button clicked');
    console.log('Current showAuth:', showAuth);
    setShowAuth(true);
    setAuthMode('login');
    setError('');
    console.log('Set showAuth to true');
  };

  // Check if user is logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    }
  }, []);

  // Fetch groups when user changes
  useEffect(() => {
    fetchGroups(user);
  }, [user]);

  // Debug logging
  console.log('Current state:', { user, showAuth, authMode });

  if (loading) {
    return <div className="App">Loading study groups...</div>;
  }

  return (
    <div className="App">
      {notification && <Notification message={notification} />}
      {editingGroup && (
        <EditGroupForm 
          group={editingGroup} 
          onSubmit={updateGroup} 
          onClose={() => setEditingGroup(null)} 
          showNotification={showNotification}
        />
      )}
      {showDetailsModal && selectedGroup && (
        <GroupDetailsModal 
          group={selectedGroup} 
          isOpen={showDetailsModal} 
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedGroup(null);
          }} 
        />
      )}
      <header className="App-header">
        <h1>Study Groups App</h1>
        {user ? (
          <div className="user-info">
            <span>Welcome, {user.name}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)} className="login-btn">Login / Register</button>
        )}
        {user && (
          <nav>
            <button 
              onClick={() => setActiveTab('my-groups')} 
              className={activeTab === 'my-groups' ? 'active' : ''}
            >
              My Groups
            </button>
            <button 
              onClick={() => setActiveTab('available')} 
              className={activeTab === 'available' ? 'active' : ''}
            >
              Available Groups
            </button>
            <button 
              onClick={() => setActiveTab('favorites')} 
              className={activeTab === 'favorites' ? 'active' : ''}
            >
              Favorites
            </button>

            <button 
              onClick={() => setActiveTab('create')} 
              className={activeTab === 'create' ? 'active' : ''}
            >
              Create Group
            </button>
          </nav>
        )}
      </header>
      <main>
        {showAuth ? (
          <AuthForm mode={authMode} onLogin={handleLogin} onRegister={handleRegister} onSwitchMode={setAuthMode} onClose={() => setShowAuth(false)} error={error} />
        ) : (
          <>
            {loading ? (
              <div className="loading-state">
                <h2>Loading groups...</h2>
                <p>Please wait while we fetch your groups.</p>
              </div>
            ) : !user ? (
              <div className="welcome-message">
                <h2>Welcome to Study Groups!</h2>
                <p>Join study groups, collaborate with peers, and achieve your academic goals together.</p>
                <button onClick={() => setShowAuth(true)} className="login-btn">Get Started</button>
              </div>
            ) : (
              <>
                {activeTab === 'my-groups' && (
              <div className="groups-section">
                <h2>My Groups</h2>
                {(() => {
                  const myGroups = groups.filter(group => group.userStatus?.isMember || group.userStatus?.isOwner);
                  console.log('My Groups filter:', {
                    totalGroups: groups.length,
                    myGroupsCount: myGroups.length,
                    groups: groups.map(g => ({ name: g.name, isMember: g.userStatus?.isMember, isOwner: g.userStatus?.isOwner }))
                  });
                  return (
                    <>
                      <p className="list-count">Found {myGroups.length} groups for you!</p>
                      <div className="groups-list">
                        {myGroups.map(group => (
                          <GroupCard 
                            key={group._id} 
                            group={group} 
                            user={user} 
                            onJoinGroup={joinGroup} 
                            onApproveRequest={approveRequest}
                            onDenyRequest={denyRequest}
                            onLeaveGroup={leaveGroup}
                            onUpdateGroup={updateGroup}
                            onDeleteGroup={deleteGroup}
                            setEditingGroup={setEditingGroup}
                            onToggleFavorite={toggleFavorite}
                            onShowDetails={(group) => {
                              setSelectedGroup(group);
                              setShowDetailsModal(true);
                            }}
                          />
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            
            {activeTab === 'available' && (
              <div className="groups-section">
                <h2>Available Groups</h2>
                {(() => {
                  const availableGroups = groups.filter(group => !group.userStatus?.isMember && !group.userStatus?.isOwner);
                  console.log('Available Groups filter:', {
                    totalGroups: groups.length,
                    availableGroupsCount: availableGroups.length,
                    groups: groups.map(g => ({ name: g.name, isMember: g.userStatus?.isMember, isOwner: g.userStatus?.isOwner }))
                  });
                  return (
                    <>
                      <p className="list-count">Found {availableGroups.length} available groups!</p>
                      <div className="groups-list">
                        {availableGroups.map(group => (
                          <GroupSummary 
                            key={group._id} 
                            group={group} 
                            user={user} 
                            onJoinGroup={joinGroup} 
                            onToggleFavorite={toggleFavorite}
                            onShowDetails={(group) => {
                              setSelectedGroup(group);
                              setShowDetailsModal(true);
                            }}
                          />
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className="groups-section">
                <h2>Favorite Groups</h2>
                {(() => {
                  const favoriteGroups = groups.filter(group => group.userStatus?.isFavorited);
                  console.log('Favorites filter:', {
                    totalGroups: groups.length,
                    favoriteGroupsCount: favoriteGroups.length,
                    groups: groups.map(g => ({ name: g.name, isFavorited: g.userStatus?.isFavorited }))
                  });
                  return (
                    <>
                      <p className="list-count">Found {favoriteGroups.length} favorite groups!</p>
                      <div className="groups-list">
                        {favoriteGroups.map(group => (
                          <GroupCard 
                            key={group._id} 
                            group={group} 
                            user={user} 
                            onJoinGroup={joinGroup} 
                            onApproveRequest={approveRequest}
                            onDenyRequest={denyRequest}
                            onLeaveGroup={leaveGroup}
                            onUpdateGroup={updateGroup}
                            onDeleteGroup={deleteGroup}
                            setEditingGroup={setEditingGroup}
                            onToggleFavorite={toggleFavorite}
                            onShowDetails={(group) => {
                              setSelectedGroup(group);
                              setShowDetailsModal(true);
                            }}
                          />
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            
            {activeTab === 'create' && (
              <CreateGroupForm onSubmit={createGroup} showNotification={showNotification} />
            )}
            

              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Authentication Form Component
function AuthForm({ mode, onLogin, onRegister, onSwitchMode, onClose, error }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with mode:', mode);
    if (mode === 'login') {
      onLogin({ email: formData.email, password: formData.password });
    } else {
      onRegister(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-form">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
            placeholder="Enter your password"
          />
          {mode === 'register' && (
            <div className="password-requirements">
              <p><strong>Password Requirements:</strong></p>
              <ul>
                <li>At least 8 characters</li>
                <li>At least one uppercase letter (A-Z)</li>
                <li>At least one lowercase letter (a-z)</li>
                <li>At least one number (0-9)</li>
                <li>At least one special character (!@#$%^&*)</li>
              </ul>
            </div>
          )}
        </div>
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      
      <div className="auth-switch">
        <button onClick={onSwitchMode}>
          {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
        <button onClick={onClose} className="cancel-btn">Cancel</button>
      </div>
    </div>
  );
}

// Create Group Form Component
function CreateGroupForm({ onSubmit, showNotification }) {
  // Get current date and time for suggestions
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Round to nearest 30 minutes
    const roundedMinutes = Math.round(minutes / 30) * 30;
    return `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    capacity: 10,
    mode: 'collaborative',
    privacy: 'public',
    meetingType: 'in-person',
    meetingDate: getCurrentDate(),
    meetingTime: getCurrentTime(),
    meetingLocation: '',
    meetingRoom: '',
    meetingUrl: '',
    meetingDuration: 60
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Comprehensive validation - ALL fields must be filled
    if (!formData.name.trim()) {
      showNotification('Please enter a group name');
      return;
    }
    if (!formData.topic.trim()) {
      showNotification('Please enter a topic');
      return;
    }
    if (!formData.description.trim()) {
      showNotification('Please enter a description');
      return;
    }
    if (!formData.capacity || formData.capacity < 2) {
      showNotification('Please enter a valid capacity (minimum 2)');
      return;
    }
    if (!formData.meetingType) {
      showNotification('Please select a meeting type');
      return;
    }
    if (!formData.meetingDate) {
      showNotification('Please select a meeting date');
      return;
    }
    if (!formData.meetingTime) {
      showNotification('Please select a meeting time');
      return;
    }
    if (!formData.meetingDuration || formData.meetingDuration < 15) {
      showNotification('Please enter a valid meeting duration (minimum 15 minutes)');
      return;
    }
    
    // Validate in-person meeting fields
    if (formData.meetingType === 'in-person') {
      if (!formData.meetingLocation.trim()) {
        showNotification('Please enter a meeting location');
        return;
      }
      if (!formData.meetingRoom.trim()) {
        showNotification('Please enter a room number');
        return;
      }
    }
    
    // Validate online/hybrid meeting fields
    if (formData.meetingType === 'online' || formData.meetingType === 'hybrid') {
      if (!formData.meetingUrl.trim()) {
        showNotification('Please enter a meeting URL');
        return;
      }
      // Basic URL validation
      if (!formData.meetingUrl.startsWith('http://') && !formData.meetingUrl.startsWith('https://')) {
        showNotification('Please enter a valid meeting URL (must start with http:// or https://)');
        return;
      }
    }
    
    // If we get here, all validation passed
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      topic: '',
      capacity: 10,
      mode: 'collaborative',
      privacy: 'public',
      meetingType: 'in-person',
      meetingDate: getCurrentDate(),
      meetingTime: getCurrentTime(),
      meetingLocation: '',
      meetingRoom: '',
      meetingUrl: '',
      meetingDuration: 60
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="create-group">
      <h2>Create New Study Group</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Group Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Topic:</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Capacity:</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="2"
            max="100"
            required
          />
        </div>
        <div>
          <label>Mode:</label>
          <select name="mode" value={formData.mode} onChange={handleChange} required>
            <option value="collaborative">Collaborative</option>
            <option value="quiet">Quiet Study</option>
          </select>
        </div>
        <div>
          <label>Privacy:</label>
          <select name="privacy" value={formData.privacy} onChange={handleChange} required>
            <option value="public">Public - Anyone can join</option>
            <option value="private">Private - Approval required</option>
          </select>
        </div>
        
        <div>
          <label>Meeting Type:</label>
          <select name="meetingType" value={formData.meetingType} onChange={handleChange} required>
            <option value="in-person">In-Person</option>
            <option value="online">Online (Zoom/Teams)</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label>Meeting Date:</label>
          <AdvancedDatePicker
            value={formData.meetingDate}
            onChange={handleChange}
            placeholder="Select date"
            required
          />
        </div>
        <div>
          <label>Meeting Time:</label>
          <AdvancedTimePicker
            value={formData.meetingTime}
            onChange={handleChange}
            placeholder="Select time"
            required
          />
        </div>
        <div>
          <label>Meeting Duration (minutes):</label>
          <input
            type="number"
            name="meetingDuration"
            value={formData.meetingDuration}
            onChange={handleChange}
            min="15"
            max="240"
            required
          />
        </div>
        
        {formData.meetingType === 'in-person' && (
          <>
            <div>
              <label>Location (Building/Campus):</label>
              <input
                type="text"
                name="meetingLocation"
                value={formData.meetingLocation}
                onChange={handleChange}
                placeholder="e.g., Baker Library, Dartmouth College"
                required
              />
            </div>
            
            {/* Library Helper */}
            <LibraryHelper />
            
            <div>
              <label>Room Number:</label>
              <input
                type="text"
                name="meetingRoom"
                value={formData.meetingRoom}
                onChange={handleChange}
                placeholder="e.g., Room 101, Study Room A"
                required
              />
            </div>
          </>
        )}
        
        {(formData.meetingType === 'online' || formData.meetingType === 'hybrid') && (
          <div>
            <label>Meeting URL (Zoom/Teams):</label>
            <input
              type="url"
              name="meetingUrl"
              value={formData.meetingUrl}
              onChange={handleChange}
              placeholder="https://zoom.us/j/123456789"
              required
            />
          </div>
        )}
        
        <button type="submit">Create Group</button>
      </form>
      
    </div>
  );
}

// Group Card Component
function GroupCard({ group, user, onJoinGroup, onApproveRequest, onDenyRequest, onLeaveGroup, onUpdateGroup, onDeleteGroup, setEditingGroup, onToggleFavorite, onShowDetails }) {
  const isOwner = Boolean(group.userStatus?.isOwner);
  const isMember = Boolean(group.userStatus?.isMember);
  const hasRequested = Boolean(group.userStatus?.hasRequested);
  const isWaitlisted = Boolean(group.userStatus?.isWaitlisted);
  const isFavorited = Boolean(group.userStatus?.isFavorited);
  const canJoin = !isMember && !hasRequested && !isOwner;
  const [showMenu, setShowMenu] = useState(false);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.three-dot-menu')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Debug logging for showDetails state
  console.log('GroupCard render for', group.name, 'showDetails:', false);

  // Debug logging
  console.log('GroupCard render:', {
    groupName: group.name,
    userStatus: group.userStatus,
    isOwner,
    isMember,
    isFavorited,
    canJoin,
    hasMeetingDate: !!group.meetingDate,
    hasMeetingType: !!group.meetingType
  });

  return (
    <div className="group-card">
      <div className="group-card-header">
        <h3>{group.name}</h3>
        <div className="card-actions">
          {user && (
            <button 
              onClick={() => onToggleFavorite(group._id)}
              className={`favorite-star ${isFavorited ? 'favorited' : ''}`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? '★' : '☆'}
            </button>
          )}
          <div className="three-dot-menu">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="three-dot-btn"
              title="More options"
            >
              ⋯
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                {isOwner && (
                  <button onClick={() => setEditingGroup(group)} className="menu-item">
                    Edit Group
                  </button>
                )}
                {isMember && !isOwner && (
                  <button onClick={() => onLeaveGroup(group._id)} className="menu-item">
                    Leave Group
                  </button>
                )}
                {isOwner && (
                  <button onClick={() => onDeleteGroup(group._id)} className="menu-item delete">
                    Delete Group
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Basic Info - Always Visible */}
      <div className="group-basic-info">
        <p><strong>Topic:</strong> {group.topic}</p>
        
        {/* Show meeting info if available, otherwise show message */}
        {group.meetingDate && group.meetingTime && group.meetingType && 
         group.meetingDate.trim() && group.meetingTime.trim() && group.meetingType.trim() ? (
          <div className="meeting-info">
            {(() => {
              const date = new Date(group.meetingDate);
              const time = group.meetingTime;
              const [hours, minutes] = time.split(':');
              const hour = parseInt(hours);
              const period = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
              const displayTime = `${displayHour}:${minutes} ${period}`;
              
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              
              const dayName = dayNames[date.getDay()];
              const monthName = monthNames[date.getMonth()];
              const day = date.getDate();
              
              const meetingTypeDisplay = group.meetingType === 'in-person' ? 'In-person' : 
                                       group.meetingType === 'online' ? 'Online' : 'Hybrid';
              
              const memberCount = group.members ? group.members.length : 0;
              const attendanceText = memberCount > 0 ? `${memberCount} going` : '';
              
              return (
                <>
                  <p className="meeting-time">{dayName}, {monthName} {day} {displayTime}</p>
                  <p className="meeting-attendance">{attendanceText ? `${attendanceText}, ` : ''}{meetingTypeDisplay}</p>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="meeting-info">
            <p><strong>Meeting Details:</strong> <span style={{color: '#e74c3c', fontStyle: 'italic'}}>Not set</span></p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="group-actions">
        {/* Show Details Button */}
        <button onClick={() => onShowDetails(group)} className="show-details-btn">
          Show Details
        </button>
      </div>

      {/* Owner Controls */}
      {isOwner && group.pendingMembers && group.pendingMembers.length > 0 && (
        <div className="owner-controls">
          <h4>Pending Requests ({group.pendingMembers.length})</h4>
          {group.pendingMembers.map(pending => (
            <div key={pending.userId} className="pending-request">
              <span>{pending.name} ({pending.email})</span>
              <div className="request-actions">
                <button onClick={() => onApproveRequest(group._id, pending.userId)} className="approve-btn">Approve</button>
                <button onClick={() => onDenyRequest(group._id, pending.userId)} className="deny-btn">Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOwner && group.waitlist && group.waitlist.length > 0 && (
        <div className="owner-controls">
          <h4>Waitlist ({group.waitlist.length})</h4>
          {group.waitlist.map(waitlistUser => (
            <div key={waitlistUser.userId} className="waitlist-item">
              <span>{waitlistUser.name} ({waitlistUser.email})</span>
              <span className="waitlist-date">Added: {new Date(waitlistUser.joinedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupSummary({ group, user, onJoinGroup, onToggleFavorite, onShowDetails }) {
  const isOwner = Boolean(group.userStatus?.isOwner);
  const isMember = Boolean(group.userStatus?.isMember);
  const hasRequested = Boolean(group.userStatus?.hasRequested);
  const isWaitlisted = Boolean(group.userStatus?.isWaitlisted);
  const isFavorited = Boolean(group.userStatus?.isFavorited);
  const canJoin = !isMember && !hasRequested && !isOwner;
 
  return (
    <div className="group-card">
      <div className="group-card-header">
        <h3>{group.name}</h3>
        <div className="card-actions">
          {user && (
            <button 
              onClick={() => onToggleFavorite(group._id)}
              className={`favorite-star ${isFavorited ? 'favorited' : ''}`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>
      
      {/* Basic Info - Always Visible */}
      <div className="group-basic-info">
        <p><strong>Topic:</strong> {group.topic}</p>
        
        {/* Show meeting info if available, otherwise show message */}
        {group.meetingDate && group.meetingTime && group.meetingType && 
         group.meetingDate.trim() && group.meetingTime.trim() && group.meetingType.trim() ? (
          <div className="meeting-info">
            {(() => {
              const date = new Date(group.meetingDate);
              const time = group.meetingTime;
              const [hours, minutes] = time.split(':');
              const hour = parseInt(hours);
              const period = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
              const displayTime = `${displayHour}:${minutes} ${period}`;
              
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              
              const dayName = dayNames[date.getDay()];
              const monthName = monthNames[date.getMonth()];
              const day = date.getDate();
              
              const meetingTypeDisplay = group.meetingType === 'in-person' ? 'In-person' : 
                                       group.meetingType === 'online' ? 'Online' : 'Hybrid';
              
              const memberCount = group.members ? group.members.length : 0;
              const attendanceText = memberCount > 0 ? `${memberCount} going` : '';
              
              return (
                <>
                  <p className="meeting-time">{dayName}, {monthName} {day} {displayTime}</p>
                  <p className="meeting-attendance">{attendanceText ? `${attendanceText}, ` : ''}{meetingTypeDisplay}</p>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="meeting-info">
            <p><strong>Meeting Details:</strong> <span style={{color: '#e74c3c', fontStyle: 'italic'}}>Not set</span></p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="group-actions">
        {canJoin && (
          <button
            onClick={() => onJoinGroup(group._id)}
            className="join-btn"
            title={group.privacy === 'public' ? 'Join this group' : 'Request to join this private group'}
          >
            {group.privacy === 'public' ? 'Join Group' : 'Request to Join'}
          </button>
        )}
        {hasRequested && (
          <button className="pending-btn" disabled>
            Request Pending...
          </button>
        )}
        {isWaitlisted && (
          <button className="pending-btn" disabled>
            ✓ Waitlisted
          </button>
        )}
        {/* Show Details Button */}
        <button onClick={() => onShowDetails(group)} className="show-details-btn">
          Show Details
        </button>
      </div>
    </div>
  );
}

function EditGroupForm({ group, onSubmit, onClose, showNotification }) {
  // Get current date and time for suggestions
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Round to nearest 30 minutes
    const roundedMinutes = Math.round(minutes / 30) * 30;
    return `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description,
    topic: group.topic,
    capacity: group.capacity,
    mode: group.mode,
    privacy: group.privacy,
    meetingType: group.meetingType || 'in-person',
    meetingDate: group.meetingDate ? new Date(group.meetingDate).toISOString().split('T')[0] : getCurrentDate(),
    meetingTime: group.meetingTime || getCurrentTime(),
    meetingLocation: group.meetingLocation || '',
    meetingRoom: group.meetingRoom || '',
    meetingUrl: group.meetingUrl || '',
    meetingDuration: group.meetingDuration || 60
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Comprehensive validation - ALL fields must be filled
    if (!formData.name.trim()) {
      showNotification('Please enter a group name');
      return;
    }
    if (!formData.topic.trim()) {
      showNotification('Please enter a topic');
      return;
    }
    if (!formData.description.trim()) {
      showNotification('Please enter a description');
      return;
    }
    if (!formData.capacity || formData.capacity < 2) {
      showNotification('Please enter a valid capacity (minimum 2)');
      return;
    }
    if (!formData.meetingType) {
      showNotification('Please select a meeting type');
      return;
    }
    if (!formData.meetingDate) {
      showNotification('Please select a meeting date');
      return;
    }
    if (!formData.meetingTime) {
      showNotification('Please select a meeting time');
      return;
    }
    if (!formData.meetingDuration || formData.meetingDuration < 15) {
      showNotification('Please enter a valid meeting duration (minimum 15 minutes)');
      return;
    }
    
    // Validate in-person meeting fields
    if (formData.meetingType === 'in-person') {
      if (!formData.meetingLocation.trim()) {
        showNotification('Please enter a meeting location');
        return;
      }
      if (!formData.meetingRoom.trim()) {
        showNotification('Please enter a room number');
        return;
      }
    }
    
    // Validate online/hybrid meeting fields
    if (formData.meetingType === 'online' || formData.meetingType === 'hybrid') {
      if (!formData.meetingUrl.trim()) {
        showNotification('Please enter a meeting URL');
        return;
      }
      // Basic URL validation
      if (!formData.meetingUrl.startsWith('http://') && !formData.meetingUrl.startsWith('https://')) {
        showNotification('Please enter a valid meeting URL (must start with http:// or https://)');
        return;
      }
    }
    
    // If we get here, all validation passed
    onSubmit(group._id, formData);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="create-group">
      <h2>Edit Study Group</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Group Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Topic:</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Capacity:</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            max="100"
            required
          />
        </div>
        <div>
          <label>Mode:</label>
          <select name="mode" value={formData.mode} onChange={handleChange} required>
            <option value="collaborative">Collaborative</option>
            <option value="quiet">Quiet Study</option>
          </select>
        </div>
        <div>
          <label>Privacy:</label>
          <select name="privacy" value={formData.privacy} onChange={handleChange} required>
            <option value="public">Public - Anyone can join</option>
            <option value="private">Private - Approval required</option>
          </select>
        </div>
        
        <div>
          <label>Meeting Type:</label>
          <select name="meetingType" value={formData.meetingType} onChange={handleChange} required>
            <option value="in-person">In-Person</option>
            <option value="online">Online (Zoom/Teams)</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label>Meeting Date:</label>
          <AdvancedDatePicker
            value={formData.meetingDate}
            onChange={handleChange}
            placeholder="Select date"
            required
          />
        </div>
        <div>
          <label>Meeting Time:</label>
          <AdvancedTimePicker
            value={formData.meetingTime}
            onChange={handleChange}
            placeholder="Select time"
            required
          />
        </div>
        <div>
          <label>Meeting Duration (minutes):</label>
          <input
            type="number"
            name="meetingDuration"
            value={formData.meetingDuration}
            onChange={handleChange}
            min="15"
            max="240"
            required
          />
        </div>
        
        {formData.meetingType === 'in-person' && (
          <>
            <div>
              <label>Location (Building/Campus):</label>
              <input
                type="text"
                name="meetingLocation"
                value={formData.meetingLocation}
                onChange={handleChange}
                placeholder="e.g., Baker Library, Dartmouth College"
                required
              />
            </div>
            
            {/* Library Helper */}
            <LibraryHelper />
            
            <div>
              <label>Room Number:</label>
              <input
                type="text"
                name="meetingRoom"
                value={formData.meetingRoom}
                onChange={handleChange}
                placeholder="e.g., Room 101, Study Room A"
                required
              />
            </div>
          </>
        )}
        
        {(formData.meetingType === 'online' || formData.meetingType === 'hybrid') && (
          <div>
            <label>Meeting URL (Zoom/Teams):</label>
            <input
              type="url"
              name="meetingUrl"
              value={formData.meetingUrl}
              onChange={handleChange}
              placeholder="https://zoom.us/j/123456789"
              required
            />
          </div>
        )}
        
        <div className="form-actions">
          <button type="submit">Update Group</button>
          <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Notification({ message }) {
  return (
    <div className="notification-bar">
      {message}
    </div>
  );
}



// Library Helper Component
function LibraryHelper() {
  return (
    <div className="library-helper">
      <p className="helper-text">
        Reserve a study room at Dartmouth Libraries for your group meeting.
      </p>
      <div className="helper-actions">
        <a 
          href="https://www.library.dartmouth.edu/visit/spaces" 
          target="_blank"
          rel="noopener noreferrer"
          className="library-link-btn"
        >
          Reserve a Room
        </a>
      </div>
    </div>
  );
}

// Group Details Modal Component
function GroupDetailsModal({ group, isOpen, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !group) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Group Details - {group.name}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="info-item topic-row">
            <strong>Topic:</strong>
            <span>{group.topic}</span>
          </div>

          <div className="info-item description-row">
            <strong>Description:</strong>
            <span>{group.description}</span>
          </div>

          <div className="details-grid">
            <div className="info-item">
              <strong>Mode:</strong>
              <span>{group.mode}</span>
            </div>
            <div className="info-item">
              <strong>Privacy:</strong>
              <span>{group.privacy}</span>
            </div>
            <div className="info-item">
              <strong>Capacity:</strong>
              <span>{group.members ? group.members.length : 0}/{group.capacity} members</span>
            </div>
            <div className="info-item">
              <strong>Duration:</strong>
              <span>{group.meetingDuration || 'Not set'} minutes</span>
            </div>
            {group.meetingDate && (
              <div className="info-item">
                <strong>Date:</strong>
                <span>{new Date(group.meetingDate).toLocaleDateString()}</span>
              </div>
            )}
            {group.meetingTime && (
              <div className="info-item">
                <strong>Time:</strong>
                <span>{group.meetingTime}</span>
              </div>
            )}
            {group.meetingType && (
              <div className="info-item">
                <strong>Type:</strong>
                <span>{group.meetingType === 'in-person' ? 'In-Person' : group.meetingType === 'online' ? 'Online' : 'Hybrid'}</span>
              </div>
            )}
            {group.meetingLocation && (
              <div className="info-item">
                <strong>Location:</strong>
                <span>{group.meetingLocation}</span>
              </div>
            )}
            {group.meetingRoom && (
              <div className="info-item">
                <strong>Room:</strong>
                <span>{group.meetingRoom}</span>
              </div>
            )}
            {group.meetingUrl && (
              <div className="info-item">
                <strong>Meeting URL:</strong>
                <span>
                  <a href={group.meetingUrl} target="_blank" rel="noopener noreferrer" className="meeting-link">
                    Join Meeting
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
