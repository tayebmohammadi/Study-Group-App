import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');

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

  if (loading) {
    return <div className="App">Loading study groups...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Study Groups App</h1>
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
      </header>

      <main>
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
      </main>
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
