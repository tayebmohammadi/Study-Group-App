import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [error, setError] = useState('');

  // Fetch groups from API
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/groups');
      setGroups(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    try {
      const response = await axios.post('http://localhost:3001/api/groups', groupData);
      setGroups([response.data, ...groups]);
      setActiveTab('list');
    } catch (error) {
      console.error('Error creating group:', error);
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

  // Debug logging
  console.log('Current state:', { user, showAuth, authMode });

  if (loading) {
    return <div className="App">Loading study groups...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Study Groups App</h1>
        
        {user ? (
          <div className="user-info">
            <span>Welcome, {user.name}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <button onClick={handleShowAuth} className="login-btn">Login / Register</button>
        )}

        {user && (
          <nav>
            <button 
              className={activeTab === 'list' ? 'active' : ''} 
              onClick={() => setActiveTab('list')}
            >
              View Groups
            </button>
            <button 
              className={activeTab === 'create' ? 'active' : ''} 
              onClick={() => setActiveTab('create')}
            >
              Create Group
            </button>
          </nav>
        )}
      </header>

      <main>
        {showAuth ? (
          <AuthForm 
            mode={authMode} 
            onLogin={handleLogin} 
            onRegister={handleRegister}
            onSwitchMode={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setError('');
            }}
            onClose={() => {
              setShowAuth(false);
              setError('');
            }}
            error={error}
          />
        ) : !user ? (
          <div className="welcome-message">
            <h2>Welcome to Study Groups!</h2>
            <p>Please login or register to start creating and joining study groups.</p>
          </div>
        ) : (
          <>
            {activeTab === 'list' && (
              <div className="groups-list">
                <h2>Study Groups ({groups.length})</h2>
                {groups.map(group => (
                  <div key={group._id} className="group-card">
                    <h3>{group.name}</h3>
                    <p><strong>Topic:</strong> {group.topic}</p>
                    <p><strong>Description:</strong> {group.description}</p>
                    <p><strong>Mode:</strong> {group.mode}</p>
                    <p><strong>Members:</strong> {group.members.length}/{group.capacity}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'create' && (
              <CreateGroupForm onSubmit={createGroup} />
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
    mode: 'collaborative'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      topic: '',
      capacity: 10,
      mode: 'collaborative'
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
            max="50"
          />
        </div>
        <div>
          <label>Mode:</label>
          <select name="mode" value={formData.mode} onChange={handleChange}>
            <option value="collaborative">Collaborative</option>
            <option value="quiet">Quiet Study</option>
          </select>
        </div>
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
}

export default App;
