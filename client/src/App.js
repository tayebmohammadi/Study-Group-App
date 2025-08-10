import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';



// Search and Filter Bar Component
function SearchFilterBar({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFiltersChange, 
  sortBy, 
  onSortChange,
  onClearFilters,
  totalGroups,
  filteredCount 
}) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearchChange]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest('.sort-section')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  const handleClearAll = () => {
    setLocalSearchQuery('');
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.meetingType !== 'all') count++;
    if (filters.mode !== 'all') count++;
    if (filters.privacy !== 'all') count++;
    if (filters.capacity !== 'all') count++;
    if (filters.timeRange !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="search-filter-container">
      {/* Main Search Bar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search groups by name, topic, or location..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="search-input"
          />
          {localSearchQuery && (
            <button 
              onClick={() => setLocalSearchQuery('')}
              className="clear-search-btn"
            >
              ×
            </button>
          )}
        </div>
        

      </div>

      {/* Filter and Sort Controls */}
      <div className="filter-sort-controls">
        <div className="filter-section">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`filter-toggle-btn ${showAdvancedFilters ? 'active' : ''}`}
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
            <span className="filter-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="6" cy="8" r="1.5" fill="currentColor"/>
                <circle cx="18" cy="8" r="1.5" fill="currentColor"/>
                <line x1="4" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="6" cy="16" r="1.5" fill="currentColor"/>
                <circle cx="18" cy="16" r="1.5" fill="currentColor"/>
              </svg>
            </span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>

        <div className="sort-section">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="sort-toggle-btn"
          >
            Sort By
            <span className="sort-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          {showSortDropdown && (
            <div className="sort-dropdown">
              <div className="sort-option" onClick={() => { onSortChange('newest'); setShowSortDropdown(false); }}>
                Newest First
              </div>
              <div className="sort-option" onClick={() => { onSortChange('oldest'); setShowSortDropdown(false); }}>
                Oldest First
              </div>
              <div className="sort-option" onClick={() => { onSortChange('name'); setShowSortDropdown(false); }}>
                Name A-Z
              </div>
              <div className="sort-option" onClick={() => { onSortChange('name-desc'); setShowSortDropdown(false); }}>
                Name Z-A
              </div>
              <div className="sort-option" onClick={() => { onSortChange('capacity'); setShowSortDropdown(false); }}>
                Capacity (Low to High)
              </div>
              <div className="sort-option" onClick={() => { onSortChange('capacity-desc'); setShowSortDropdown(false); }}>
                Capacity (High to Low)
              </div>
              <div className="sort-option" onClick={() => { onSortChange('date'); setShowSortDropdown(false); }}>
                Meeting Date
              </div>
              <div className="sort-option" onClick={() => { onSortChange('popularity'); setShowSortDropdown(false); }}>
                Most Members
              </div>
            </div>
          )}
        </div>

        <div className="results-count">
          <span>{filteredCount} groups</span>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Meeting Type:</label>
              <select
                value={filters.meetingType}
                onChange={(e) => onFiltersChange('meetingType', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="in-person">In-Person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Study Mode:</label>
              <select
                value={filters.mode}
                onChange={(e) => onFiltersChange('mode', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Modes</option>
                <option value="collaborative">Collaborative</option>
                <option value="quiet">Quiet Study</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Privacy:</label>
              <select
                value={filters.privacy}
                onChange={(e) => onFiltersChange('privacy', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Groups</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Capacity:</label>
              <select
                value={filters.capacity}
                onChange={(e) => onFiltersChange('capacity', e.target.value)}
                className="filter-select"
              >
                <option value="all">Any Size</option>
                <option value="small">Small (2-5 people)</option>
                <option value="medium">Medium (6-10 people)</option>
                <option value="large">Large (11+ people)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Time Range:</label>
              <select
                value={filters.timeRange}
                onChange={(e) => onFiltersChange('timeRange', e.target.value)}
                className="filter-select"
              >
                <option value="all">Any Time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this-week">This Week</option>
                <option value="next-week">Next Week</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Location:</label>
              <input
                type="text"
                placeholder="Search by location..."
                value={filters.location}
                onChange={(e) => onFiltersChange('location', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState('available');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    meetingType: 'all',
    mode: 'all',
    privacy: 'all',
    capacity: 'all',
    timeRange: 'all',
    location: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [showPastGroups, setShowPastGroups] = useState(false);
  const [showPastGroupsModal, setShowPastGroupsModal] = useState(false);
  const [showCornerMenu, setShowCornerMenu] = useState(false);

  // Close corner menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCornerMenu && !event.target.closest('.menu-container')) {
        setShowCornerMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCornerMenu]);


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
      // Fetch groups immediately when user is restored
      fetchGroups(parsedUser);
    }
  }, []);

  // Fetch groups when user changes (but not on initial load)
  useEffect(() => {
    if (user && groups.length === 0) {
      fetchGroups(user);
    }
  }, [user]);

  // Filter and sort groups whenever groups, searchQuery, filters, or sortBy changes
  useEffect(() => {
    let filtered = [...groups];

    // Separate active and past groups
    const now = new Date();
    const activeGroups = [];
    const pastGroups = [];
    
    filtered.forEach(group => {
      if (group.meetingDate && group.meetingTime) {
        const meetingDateTime = new Date(`${group.meetingDate}T${group.meetingTime}`);
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        if (meetingDateTime < now && meetingDateTime > thirtyDaysAgo) {
          // Past group within 30 days (archived)
          pastGroups.push({ ...group, isArchived: true });
        } else if (meetingDateTime >= now) {
          // Future group (active)
          activeGroups.push({ ...group, isArchived: false });
        } else {
          // Very old group (older than 30 days) - exclude from both
          // These should be auto-deleted by the backend
        }
      } else {
        // Group without meeting date/time - treat as active
        activeGroups.push({ ...group, isArchived: false });
      }
    });
    
    // Use appropriate group list based on showPastGroups state
    const groupsToFilter = showPastGroups ? pastGroups : activeGroups;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = groupsToFilter.filter(group => 
        group.name.toLowerCase().includes(query) ||
        group.topic.toLowerCase().includes(query) ||
        (group.description && group.description.toLowerCase().includes(query)) ||
        (group.meetingLocation && group.meetingLocation.toLowerCase().includes(query)) ||
        (group.meetingRoom && group.meetingRoom.toLowerCase().includes(query))
      );
    } else {
      filtered = groupsToFilter;
    }

    // Apply filters (only for active groups)
    if (!showPastGroups) {
      if (filters.meetingType !== 'all') {
        filtered = filtered.filter(group => group.meetingType === filters.meetingType);
      }

      if (filters.mode !== 'all') {
        filtered = filtered.filter(group => group.mode === filters.mode);
      }

      if (filters.privacy !== 'all') {
        filtered = filtered.filter(group => group.privacy === filters.privacy);
      }

      if (filters.capacity !== 'all') {
        filtered = filtered.filter(group => {
          const memberCount = group.members ? group.members.length : 0;
          switch (filters.capacity) {
            case 'small':
              return memberCount <= 5;
            case 'medium':
              return memberCount >= 6 && memberCount <= 10;
            case 'large':
              return memberCount >= 11;
            default:
              return true;
          }
        });
      }

      if (filters.timeRange !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        filtered = filtered.filter(group => {
          if (!group.meetingDate) return false;
          const meetingDate = new Date(group.meetingDate);
          
          switch (filters.timeRange) {
            case 'today':
              return meetingDate.getTime() === today.getTime();
            case 'tomorrow':
              return meetingDate.getTime() === tomorrow.getTime();
            case 'this-week':
              return meetingDate >= today && meetingDate < nextWeek;
            case 'next-week':
              const weekAfter = new Date(nextWeek);
              weekAfter.setDate(weekAfter.getDate() + 7);
              return meetingDate >= nextWeek && meetingDate < weekAfter;
            default:
              return true;
          }
        });
      }

      if (filters.location.trim()) {
        const locationQuery = filters.location.toLowerCase();
        filtered = filtered.filter(group => 
          (group.meetingLocation && group.meetingLocation.toLowerCase().includes(locationQuery)) ||
          (group.meetingRoom && group.meetingRoom.toLowerCase().includes(locationQuery))
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'capacity':
          return (a.capacity || 0) - (b.capacity || 0);
        case 'capacity-desc':
          return (b.capacity || 0) - (a.capacity || 0);
        case 'date':
          if (!a.meetingDate && !b.meetingDate) return 0;
          if (!a.meetingDate) return 1;
          if (!b.meetingDate) return -1;
          return new Date(a.meetingDate) - new Date(b.meetingDate);
        case 'popularity':
          const aMembers = a.members ? a.members.length : 0;
          const bMembers = b.members ? b.members.length : 0;
          return bMembers - aMembers;
        default:
          return 0;
      }
    });

    setFilteredGroups(filtered);
  }, [groups, searchQuery, filters, sortBy, showPastGroups]);

  // Filter handlers
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (sortValue) => {
    setSortBy(sortValue);
  };

  const handleClearFilters = () => {
    setFilters({
      meetingType: 'all',
      mode: 'all',
      privacy: 'all',
      capacity: 'all',
      timeRange: 'all',
      location: ''
    });
    setSearchQuery('');
  };

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
        <div className="header-top">
          <h1 className="app-title"><span className="capital-j">J</span>oin<span className="capital-u">U</span>p</h1>
          {!user && (
            <div className="header-actions">
              <button onClick={() => setShowAuth(true)} className="login-btn">Login / Register</button>
            </div>
          )}
        </div>
        {user && (
          <nav className="main-nav">
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



      {/* Search and Filter Bar */}
      {user && activeTab !== 'create' && (
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          totalGroups={groups.length}
          filteredCount={(() => {
            // Return the count based on the active tab
            switch (activeTab) {
              case 'my-groups':
                return filteredGroups.filter(group => group.userStatus?.isMember || group.userStatus?.isOwner).length;
              case 'available':
                return filteredGroups.filter(group => !group.userStatus?.isMember && !group.userStatus?.isOwner).length;
              case 'favorites':
                return filteredGroups.filter(group => group.userStatus?.isFavorited).length;
              default:
                return filteredGroups.length;
            }
          })()}
        />
      )}
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
                {(() => {
                  const myGroups = filteredGroups.filter(group => group.userStatus?.isMember || group.userStatus?.isOwner);
                  console.log('My Groups filter:', {
                    totalGroups: groups.length,
                    filteredGroups: filteredGroups.length,
                    myGroupsCount: myGroups.length,
                    groups: groups.map(g => ({ name: g.name, isMember: g.userStatus?.isMember, isOwner: g.userStatus?.isOwner }))
                  });
                  return (
                    <>
                      {myGroups.length > 0 ? (
                        <>
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
                      ) : (
                        <div className="no-results">
                          <h3>No groups found</h3>
                          <p>{showPastGroups ? "You haven't participated in any past groups." : "Try adjusting your search or filters to find more groups."}</p>
                          {!showPastGroups && (
                            <button onClick={handleClearFilters} className="clear-filters-btn">
                              Clear All Filters
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            
            {activeTab === 'available' && (
              <div className="groups-section">
                {(() => {
                  const availableGroups = filteredGroups.filter(group => !group.userStatus?.isMember && !group.userStatus?.isOwner);
                  console.log('Available Groups filter:', {
                    totalGroups: groups.length,
                    filteredGroups: filteredGroups.length,
                    availableGroupsCount: availableGroups.length,
                    groups: groups.map(g => ({ name: g.name, isMember: g.userStatus?.isMember, isOwner: g.userStatus?.isOwner }))
                  });
                  return (
                    <>
                      {availableGroups.length > 0 ? (
                        <>
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
                      ) : (
                        <div className="no-results">
                          <h3>No available groups found</h3>
                          <p>{showPastGroups ? "No past groups available to view." : "Try adjusting your search or filters to find more groups."}</p>
                          {!showPastGroups && (
                            <button onClick={handleClearFilters} className="clear-filters-btn">
                              Clear All Filters
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className="groups-section">
                {(() => {
                  const favoriteGroups = filteredGroups.filter(group => group.userStatus?.isFavorited);
                  console.log('Favorites filter:', {
                    totalGroups: groups.length,
                    filteredGroups: filteredGroups.length,
                    favoriteGroupsCount: favoriteGroups.length,
                    groups: groups.map(g => ({ name: g.name, isFavorited: g.userStatus?.isFavorited }))
                  });
                  return (
                    <>
                      {favoriteGroups.length > 0 ? (
                        <>
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
                      ) : (
                        <div className="no-results">
                          <h3>No favorite groups found</h3>
                          <p>Start favoriting groups to see them here!</p>
                          <button onClick={() => setActiveTab('available')} className="clear-filters-btn">
                            Browse Groups
                          </button>
                        </div>
                      )}
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
        
        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>JoinUp</h3>
              <p>Connect with fellow students, join study groups, and achieve your academic goals together. Building communities, one group at a time.</p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><button onClick={() => setActiveTab('available')}>Find Groups</button></li>
                <li><button onClick={() => setActiveTab('create')}>Create Group</button></li>
                <li><button onClick={() => setActiveTab('my-groups')}>My Groups</button></li>
                <li><button onClick={() => setActiveTab('favorites')}>Favorites</button></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contact</h4>
              <ul>
                <li>📧 support@joinup.edu</li>
                <li>📱 (603) 646-0000</li>
                <li>📍 Dartmouth College</li>
                <li>🕒 Mon-Fri 9AM-5PM</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">💼</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; 2024 JoinUp. All rights reserved.</p>
              <div className="footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Corner Menu */}
        {user && (
          <div className="corner-menu">
            <div className="user-info-corner">
              <span className="welcome-text">Welcome, {user.name}!</span>
            </div>
            <div className="menu-container">
              <button 
                className="corner-menu-btn"
                onClick={() => setShowCornerMenu(!showCornerMenu)}
                title="Menu"
              >
                <span className="menu-icon">☰</span>
              </button>
              
              {showCornerMenu && (
                <div className="corner-menu-dropdown">
                  {(() => {
                    const userPastGroups = groups.filter(group => {
                      if (group.meetingDate && group.meetingTime) {
                        const meetingDateTime = new Date(`${group.meetingDate}T${group.meetingTime}`);
                        const now = new Date();
                        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                        return meetingDateTime < now && 
                               meetingDateTime > thirtyDaysAgo &&
                               (group.userStatus?.isMember || group.userStatus?.isOwner);
                      }
                      return false;
                    });
                    
                    if (userPastGroups.length > 0) {
                      return (
                        <button 
                          className="menu-item"
                          onClick={() => {
                            setShowPastGroupsModal(true);
                            setShowCornerMenu(false);
                          }}
                        >
                          <span className="menu-item-icon">📅</span>
                          Past Groups
                        </button>
                      );
                    }
                    return null;
                  })()}
                  <button 
                    className="menu-item logout-item"
                    onClick={() => {
                      handleLogout();
                      setShowCornerMenu(false);
                    }}
                  >
                    <span className="menu-item-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Past Groups Modal */}
        {showPastGroupsModal && (
          <div className="past-groups-modal-overlay" onClick={() => setShowPastGroupsModal(false)}>
            <div className="past-groups-modal" onClick={(e) => e.stopPropagation()}>
              <div className="past-groups-modal-header">
                <h3>Past Groups</h3>
                <button 
                  className="past-groups-modal-close"
                  onClick={() => setShowPastGroupsModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="past-groups-modal-content">
                {(() => {
                  const userPastGroups = groups.filter(group => {
                    if (group.meetingDate && group.meetingTime) {
                      const meetingDateTime = new Date(`${group.meetingDate}T${group.meetingTime}`);
                      const now = new Date();
                      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                      return meetingDateTime < now && 
                             meetingDateTime > thirtyDaysAgo &&
                             (group.userStatus?.isMember || group.userStatus?.isOwner);
                    }
                    return false;
                  });
                  
                  return userPastGroups.length > 0 ? (
                    <div className="groups-list">
                      {userPastGroups.map(group => (
                        <GroupCard
                          key={group._id}
                          group={{ ...group, isArchived: true }}
                          user={user}
                          onJoinGroup={() => {}} // Disabled for archived groups
                          onApproveRequest={() => {}}
                          onDenyRequest={() => {}}
                          onLeaveGroup={() => {}}
                          onUpdateGroup={() => {}}
                          onDeleteGroup={() => {}}
                          setEditingGroup={() => {}}
                          onToggleFavorite={toggleFavorite}
                          onShowDetails={(group) => {
                            setSelectedGroup(group);
                            setShowDetailsModal(true);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="no-results">
                      <h3>No past groups</h3>
                      <p>You haven't participated in any groups that have ended recently.</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
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
    <div className={`group-card ${group.isArchived ? 'archived' : ''}`}>
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
