import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

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

  // Fetch groups from API
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      if (user) {
        const response = await axios.get(`http://localhost:3001/api/groups/user/${user._id}`);
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
      await fetchGroups();
      
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
      setGroups([response.data, ...groups]);
      setActiveTab('list');
      showNotification('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
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
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch groups when user changes
  useEffect(() => {
    if (user) {
      fetchGroups();
    }
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
                <div className="groups-list">
                  {(() => {
                    const myGroups = groups.filter(group => group.userStatus?.isMember || group.userStatus?.isOwner);
                    console.log('My Groups filter:', {
                      totalGroups: groups.length,
                      myGroupsCount: myGroups.length,
                      groups: groups.map(g => ({ name: g.name, isMember: g.userStatus?.isMember, isOwner: g.userStatus?.isOwner }))
                    });
                    return (
                      <>
                        <p style={{color: 'green', fontWeight: 'bold'}}>Found {myGroups.length} groups for you!</p>
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
                          />
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {activeTab === 'available' && (
              <div className="groups-section">
                <h2>Available Groups</h2>
                <div className="groups-list">
                  {(() => {
                    const availableGroups = groups.filter(group => !group.userStatus?.isMember && !group.userStatus?.isOwner);
                    console.log('Available Groups filter:', {
                      totalGroups: groups.length,
                      availableGroupsCount: availableGroups.length,
                      groups: groups.map(g => ({ name: g.name, isMember: g.userStatus?.isMember, isOwner: g.userStatus?.isOwner }))
                    });
                    return (
                      <>
                        <p style={{color: 'green', fontWeight: 'bold'}}>Found {availableGroups.length} available groups!</p>
                        {availableGroups.map(group => (
                          <GroupSummary 
                            key={group._id} 
                            group={group} 
                            user={user} 
                            onJoinGroup={joinGroup} 
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className="groups-section">
                <h2>Favorite Groups</h2>
                <div className="groups-list">
                  {(() => {
                    const favoriteGroups = groups.filter(group => group.userStatus?.isFavorited);
                    console.log('Favorites filter:', {
                      totalGroups: groups.length,
                      favoriteGroupsCount: favoriteGroups.length,
                      groups: groups.map(g => ({ name: g.name, isFavorited: g.userStatus?.isFavorited }))
                    });
                    return (
                      <>
                        <p style={{color: 'green', fontWeight: 'bold'}}>Found {favoriteGroups.length} favorite groups!</p>
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
                          />
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {activeTab === 'create' && (
              <CreateGroupForm onSubmit={createGroup} />
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
function CreateGroupForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    capacity: 10,
    mode: 'collaborative',
    privacy: 'public',
    meetingType: 'in-person',
    meetingDate: '',
    meetingTime: '',
    meetingLocation: '',
    meetingRoom: '',
    meetingUrl: '',
    meetingDuration: 60
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      topic: '',
      capacity: 10,
      mode: 'collaborative',
      privacy: 'public',
      meetingType: 'in-person',
      meetingDate: '',
      meetingTime: '',
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
            min="1"
            max="100"
          />
        </div>
        <div>
          <label>Mode:</label>
          <select name="mode" value={formData.mode} onChange={handleChange}>
            <option value="collaborative">Collaborative</option>
            <option value="quiet">Quiet Study</option>
          </select>
        </div>
        <div>
          <label>Privacy:</label>
          <select name="privacy" value={formData.privacy} onChange={handleChange}>
            <option value="public">Public - Anyone can join</option>
            <option value="private">Private - Approval required</option>
          </select>
        </div>
        
        {/* Meeting Details Section */}
        <div className="meeting-details">
          <h3>Meeting Details</h3>
          <div>
            <label>Meeting Type:</label>
            <select name="meetingType" value={formData.meetingType} onChange={handleChange}>
              <option value="in-person">In-Person</option>
              <option value="online">Online (Zoom/Teams)</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label>Meeting Date:</label>
            <input
              type="date"
              name="meetingDate"
              value={formData.meetingDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Meeting Time:</label>
            <input
              type="time"
              name="meetingTime"
              value={formData.meetingTime}
              onChange={handleChange}
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
                />
              </div>
              <div>
                <label>Room Number:</label>
                <input
                  type="text"
                  name="meetingRoom"
                  value={formData.meetingRoom}
                  onChange={handleChange}
                  placeholder="e.g., Room 101, Study Room A"
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
              />
            </div>
          )}
        </div>
        
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
}

// Group Card Component
function GroupCard({ group, user, onJoinGroup, onApproveRequest, onDenyRequest, onLeaveGroup, onUpdateGroup, onDeleteGroup, setEditingGroup, onToggleFavorite }) {
  const isOwner = group.userStatus?.isOwner;
  const isMember = group.userStatus?.isMember;
  const hasRequested = group.userStatus?.hasRequested;
  const isWaitlisted = group.userStatus?.isWaitlisted;
  const isFavorited = group.userStatus?.isFavorited;
  const canJoin = !isMember && !hasRequested && !isOwner;
  const [showDetails, setShowDetails] = useState(false);

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
      
      {/* Basic Info - Always Visible */}
      <div className="group-basic-info">
        <p><strong>Topic:</strong> {group.topic}</p>
        <p><strong>Members:</strong> {group.members ? group.members.length : 0}/{group.capacity}</p>
        
        {group.meetingDate && (
          <div className="meeting-basic-info">
            <p><strong>Date:</strong> {new Date(group.meetingDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {group.meetingTime}</p>
            <p><strong>Type:</strong> {group.meetingType === 'in-person' ? 'In-Person' : group.meetingType === 'online' ? 'Online' : 'Hybrid'}</p>
            {group.meetingLocation && (
              <p><strong>Location:</strong> {group.meetingLocation}</p>
            )}
          </div>
        )}
      </div>

      {/* Hidden Details Popup */}
      {showDetails && (
        <div className="details-popup-overlay" onClick={() => setShowDetails(false)}>
          <div className="details-popup" onClick={(e) => e.stopPropagation()}>
            <h4>Group Details</h4>
            <div className="popup-content">
              <p><strong>Description:</strong> {group.description}</p>
              <p><strong>Mode:</strong> {group.mode}</p>
              <p><strong>Privacy:</strong> {group.privacy}</p>
              <p><strong>Duration:</strong> {group.meetingDuration} minutes</p>
              
              {/* Show room/URL only for members */}
              {(isMember || isOwner) && (
                <>
                  {group.meetingRoom && (
                    <p><strong>Room:</strong> {group.meetingRoom}</p>
                  )}
                  {group.meetingUrl && (
                    <p><strong>Meeting URL:</strong> 
                      <a href={group.meetingUrl} target="_blank" rel="noopener noreferrer" className="meeting-link">
                        Join Meeting
                      </a>
                    </p>
                  )}
                </>
              )}
            </div>
            <button onClick={() => setShowDetails(false)} className="close-popup-btn">Close</button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="group-actions">
        {canJoin && (
          <button onClick={() => onJoinGroup(group._id)} className="join-btn">
            {group.privacy === 'public' ? 'Join Group' : 'Request to Join'}
          </button>
        )}

        {hasRequested && (
          <span className="pending-status">Request Pending...</span>
        )}

        {isWaitlisted && (
          <span className="waitlist-status">✓ Waitlisted</span>
        )}

        {isMember && !isOwner && (
          <button onClick={() => onLeaveGroup(group._id)} className="leave-btn">Leave Group</button>
        )}

        {isOwner && (
          <>
            <button onClick={() => setEditingGroup(group)} className="edit-btn">Edit Group</button>
            <button onClick={() => onDeleteGroup(group._id)} className="delete-btn">Delete Group</button>
          </>
        )}

        {/* Show Details Button */}
        <button onClick={() => setShowDetails(true)} className="show-details-btn">
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

function GroupSummary({ group, user, onJoinGroup, onToggleFavorite }) {
  const isOwner = group.userStatus?.isOwner;
  const isMember = group.userStatus?.isMember;
  const hasRequested = group.userStatus?.hasRequested;
  const isWaitlisted = group.userStatus?.isWaitlisted;
  const isFavorited = group.userStatus?.isFavorited;
  const canJoin = !isMember && !hasRequested && !isOwner;

  return (
    <div className="group-card">
      <div className="group-card-header">
        <h3>{group.name}</h3>
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
      <p><strong>Topic:</strong> {group.topic}</p>
      <p><strong>Description:</strong> {group.description}</p>
      <p><strong>Mode:</strong> {group.mode}</p>
      <p><strong>Members:</strong> {group.members ? group.members.length : 0}/{group.capacity}</p>
      {group.waitlist && group.waitlist.length > 0 && (
        <p><strong>Waitlist:</strong> {group.waitlist.length} people</p>
      )}
      <p><strong>Privacy:</strong> <span className={`privacy-${group.privacy}`}>{group.privacy}</span></p>
      
      {/* Basic Meeting Info (Always Visible) */}
      {group.meetingDate && (
        <div className="meeting-info-basic">
          <h4>📅 Meeting Details</h4>
          <p><strong>Type:</strong> {group.meetingType}</p>
          <p><strong>Date:</strong> {new Date(group.meetingDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {group.meetingTime}</p>
          <p><strong>Duration:</strong> {group.meetingDuration} minutes</p>
          
          {/* Show location/room only for members or when details are expanded */}
          {(isMember || isOwner) && group.meetingType === 'in-person' && group.meetingLocation && (
            <p><strong>📍 Location:</strong> {group.meetingLocation}</p>
          )}
          
          {(isMember || isOwner) && group.meetingType === 'in-person' && group.meetingRoom && (
            <p><strong>🏢 Room:</strong> {group.meetingRoom}</p>
          )}
          
          {/* Show meeting URL only for members or when details are expanded */}
          {(isMember || isOwner) && (group.meetingType === 'online' || group.meetingType === 'hybrid') && group.meetingUrl && (
            <p><strong>🔗 Meeting URL:</strong> 
              <a href={group.meetingUrl} target="_blank" rel="noopener noreferrer" className="meeting-link">
                Join Meeting
              </a>
            </p>
          )}
        </div>
      )}
      
      {canJoin && (
        <button onClick={() => onJoinGroup(group._id)} className="join-btn">
          {group.privacy === 'public' ? 'Join Group' : 'Request to Join'}
        </button>
      )}

      {hasRequested && (
        <span className="pending-status">Request Pending...</span>
      )}

      {isWaitlisted && (
        <span className="waitlist-status">✓ Waitlisted</span>
      )}
    </div>
  );
}

function EditGroupForm({ group, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description,
    topic: group.topic,
    capacity: group.capacity,
    mode: group.mode,
    privacy: group.privacy,
    meetingType: group.meetingType || 'in-person',
    meetingDate: group.meetingDate ? new Date(group.meetingDate).toISOString().split('T')[0] : '',
    meetingTime: group.meetingTime || '',
    meetingLocation: group.meetingLocation || '',
    meetingRoom: group.meetingRoom || '',
    meetingUrl: group.meetingUrl || '',
    meetingDuration: group.meetingDuration || 60
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
          />
        </div>
        <div>
          <label>Mode:</label>
          <select name="mode" value={formData.mode} onChange={handleChange}>
            <option value="collaborative">Collaborative</option>
            <option value="quiet">Quiet Study</option>
          </select>
        </div>
        <div>
          <label>Privacy:</label>
          <select name="privacy" value={formData.privacy} onChange={handleChange}>
            <option value="public">Public - Anyone can join</option>
            <option value="private">Private - Approval required</option>
          </select>
        </div>
        
        {/* Meeting Details Section */}
        <div className="meeting-details">
          <h3>Meeting Details</h3>
          <div>
            <label>Meeting Type:</label>
            <select name="meetingType" value={formData.meetingType} onChange={handleChange}>
              <option value="in-person">In-Person</option>
              <option value="online">Online (Zoom/Teams)</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label>Meeting Date:</label>
            <input
              type="date"
              name="meetingDate"
              value={formData.meetingDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Meeting Time:</label>
            <input
              type="time"
              name="meetingTime"
              value={formData.meetingTime}
              onChange={handleChange}
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
                />
              </div>
              <div>
                <label>Room Number:</label>
                <input
                  type="text"
                  name="meetingRoom"
                  value={formData.meetingRoom}
                  onChange={handleChange}
                  placeholder="e.g., Room 101, Study Room A"
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
              />
            </div>
          )}
        </div>
        
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

export default App;
