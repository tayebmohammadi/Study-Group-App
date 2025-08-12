import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
  topic: string;
  description: string;
  capacity: number;
  privacy: string;
  meetingType: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingLocation?: string;
  meetingRoom?: string;
  meetingUrl?: string;
  meetingDuration?: number;
  members: any[];
  pendingMembers?: any[];
  waitlist?: any[];
  userStatus?: {
    isOwner: boolean;
    isMember: boolean;
    isFavorited: boolean;
    hasRequested: boolean;
    isWaitlisted: boolean;
  };
}

interface Filters {
  meetingType: string;
  mode: string;
  privacy: string;
  capacity: string;
  timeRange: string;
  location: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState<Filters>({
    meetingType: 'all',
    mode: 'all',
    privacy: 'all',
    capacity: 'all',
    timeRange: 'all',
    location: ''
  });

  // Check if user is logged in on app start
  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };
    loadUser();
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      if (user) {
        const response = await axios.get(`http://localhost:3001/api/groups/user/${user._id}`);
        setGroups(response.data);
      } else {
        const response = await axios.get('http://localhost:3001/api/groups');
        setGroups(response.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      Alert.alert('Error', 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (loginData: { email: string; password: string }) => {
    try {
      setError('');
      console.log('Attempting login with:', loginData);
      const response = await axios.post('http://localhost:3001/api/auth/login', loginData);
      console.log('Login successful:', response.data);
      setUser(response.data);
      setShowAuth(false);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      await fetchGroups();
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      Alert.alert('Login Error', errorMessage);
    }
  };

  const handleRegister = async (registerData: { name: string; email: string; password: string }) => {
    try {
      setError('');
      console.log('Attempting registration with:', registerData);
      const response = await axios.post('http://localhost:3001/api/auth/register', registerData);
      console.log('Registration successful:', response.data);
      setUser(response.data);
      setShowAuth(false);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      await fetchGroups();
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      Alert.alert('Registration Error', errorMessage);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const joinGroup = async (groupId: string) => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      const response = await axios.post(`http://localhost:3001/api/groups/${groupId}/join`, {
        userId: user._id,
        name: user.name,
        email: user.email
      });
      
      await fetchGroups();
      showNotification(response.data.message);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to join group';
      showNotification(errorMessage);
    }
  };

  const toggleFavorite = async (groupId: string) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/groups/${groupId}/favorite`, {
        userId: user!._id
      });
      await fetchGroups();
      showNotification(response.data.message);
    } catch (error) {
      showNotification('Failed to update favorite');
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const renderGroupCard = (group: Group) => (
    <View key={group._id} style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{group.name}</Text>
        {user && (
          <TouchableOpacity 
            onPress={() => toggleFavorite(group._id)}
            style={styles.favoriteButton}
          >
            <Text style={styles.favoriteIcon}>
              {group.userStatus?.isFavorited ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.groupTopic}>Topic: {group.topic}</Text>
      <Text style={styles.groupDescription} numberOfLines={2}>
        {group.description}
      </Text>
      
      {group.meetingDate && group.meetingTime && (
        <Text style={styles.meetingInfo}>
          📅 {new Date(group.meetingDate).toLocaleDateString()} at {group.meetingTime}
        </Text>
      )}
      
      <Text style={styles.memberInfo}>
        👥 {group.members?.length || 0}/{group.capacity} members
      </Text>
      
      {!group.userStatus?.isMember && !group.userStatus?.isOwner && (
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => joinGroup(group._id)}
        >
          <Text style={styles.joinButtonText}>
            {group.privacy === 'public' ? 'Join Group' : 'Request to Join'}
          </Text>
        </TouchableOpacity>
      )}
      
      {group.userStatus?.isMember && (
        <Text style={styles.memberBadge}>✓ Member</Text>
      )}
      
      {group.userStatus?.isOwner && (
        <Text style={styles.ownerBadge}>👑 Owner</Text>
      )}
    </View>
  );

  const renderTabContent = () => {
    let filteredGroups = [...groups];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredGroups = filteredGroups.filter(group => 
        group.name.toLowerCase().includes(query) ||
        group.topic.toLowerCase().includes(query) ||
        (group.description && group.description.toLowerCase().includes(query))
      );
    }

    // Apply other filters
    if (filters.meetingType !== 'all') {
      filteredGroups = filteredGroups.filter(group => group.meetingType === filters.meetingType);
    }
    if (filters.privacy !== 'all') {
      filteredGroups = filteredGroups.filter(group => group.privacy === filters.privacy);
    }

    // Apply sorting
    filteredGroups.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    switch (activeTab) {
      case 'available':
        return filteredGroups.filter(group => 
          !group.userStatus?.isMember && !group.userStatus?.isOwner
        ).map(renderGroupCard);
      
      case 'my-groups':
        return filteredGroups.filter(group => 
          group.userStatus?.isMember || group.userStatus?.isOwner
        ).map(renderGroupCard);
      
      case 'favorites':
        return filteredGroups.filter(group => 
          group.userStatus?.isFavorited
        ).map(renderGroupCard);
      
      default:
        return <Text>Select a tab</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>JoinUp</Text>
        {user ? (
          <View style={styles.userSection}>
            <Text style={styles.userInfo}>Welcome, {user.name}!</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setShowAuth(true)} style={styles.loginButton}>
            <Text style={styles.loginText}>Login / Register</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      {user && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search groups..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearch}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Navigation */}
      {user && (
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
            onPress={() => setActiveTab('available')}
          >
            <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
              Available
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'my-groups' && styles.activeTab]}
            onPress={() => setActiveTab('my-groups')}
          >
            <Text style={[styles.tabText, activeTab === 'my-groups' && styles.activeTabText]}>
              My Groups
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Favorites
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading groups...</Text>
          </View>
        ) : !user ? (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to JoinUp!</Text>
            <Text style={styles.welcomeText}>
              Join study groups, collaborate with peers, and achieve your academic goals together.
            </Text>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={() => setShowAuth(true)}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.groupsContainer}>
            {renderTabContent()}
          </View>
        )}
      </ScrollView>

      {/* Create Group Button */}
      {user && (
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateGroup(true)}
        >
          <Text style={styles.createButtonText}>+ Create Group</Text>
        </TouchableOpacity>
      )}

      {/* Notification */}
      {notification && (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>{notification}</Text>
        </View>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal 
          mode={authMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSwitchMode={setAuthMode}
          onClose={() => setShowAuth(false)}
          error={error}
        />
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal 
          onSubmit={async (groupData) => {
            try {
              console.log('Creating group with data:', groupData);
              const groupWithOwner = {
                ...groupData,
                ownerId: user!._id,
                ownerName: user!.name,
                ownerEmail: user!.email
              };
              console.log('Group with owner data:', groupWithOwner);
              
              const response = await axios.post('http://localhost:3001/api/groups', groupWithOwner);
              console.log('Group created successfully:', response.data);
              
              await fetchGroups();
              setShowCreateGroup(false);
              showNotification('Group created successfully!');
            } catch (error: any) {
              console.error('Error creating group:', error);
              const errorMessage = error.response?.data?.message || 'Failed to create group';
              showNotification(errorMessage);
              Alert.alert('Error', errorMessage);
            }
          }}
          onClose={() => setShowCreateGroup(false)}
        />
      )}
    </SafeAreaView>
  );
}

// Auth Modal Component
function AuthModal({ mode, onLogin, onRegister, onSwitchMode, onClose, error }: any) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = () => {
    if (mode === 'login') {
      onLogin({ email: formData.email, password: formData.password });
    } else {
      onRegister(formData);
    }
  };

  const handleSwitchMode = () => {
    setFormData({ name: '', email: '', password: '' }); // Clear form when switching
    onSwitchMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {mode === 'login' ? 'Login' : 'Register'}
          </Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {mode === 'login' ? 'Login' : 'Register'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleSwitchMode}>
            <Text style={styles.switchModeText}>
              {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Create Group Modal Component
function CreateGroupModal({ onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    description: '',
    capacity: 10,
    privacy: 'public',
    mode: 'collaborative',
    meetingType: 'in-person',
    meetingDate: '',
    meetingTime: '',
    meetingLocation: '',
    meetingRoom: '',
    meetingUrl: '',
    meetingDuration: 60
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const dateString = date.toISOString().split('T')[0];
      setFormData({...formData, meetingDate: dateString});
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      const timeString = time.toTimeString().split(' ')[0].substring(0, 5);
      setFormData({...formData, meetingTime: timeString});
    }
  };

  const handleSubmit = () => {
    // Comprehensive validation - ALL fields must be filled
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (!formData.topic.trim()) {
      Alert.alert('Error', 'Please enter a topic');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!formData.capacity || formData.capacity < 2) {
      Alert.alert('Error', 'Please enter a valid capacity (minimum 2)');
      return;
    }
    if (!formData.meetingType) {
      Alert.alert('Error', 'Please select a meeting type');
      return;
    }
    if (!formData.meetingDate) {
      Alert.alert('Error', 'Please select a meeting date');
      return;
    }
    if (!formData.meetingTime) {
      Alert.alert('Error', 'Please select a meeting time');
      return;
    }
    if (!formData.meetingDuration || formData.meetingDuration < 15) {
      Alert.alert('Error', 'Please enter a valid meeting duration (minimum 15 minutes)');
      return;
    }
    
    // Validate in-person meeting fields
    if (formData.meetingType === 'in-person') {
      if (!formData.meetingLocation.trim()) {
        Alert.alert('Error', 'Please enter a meeting location');
        return;
      }
      if (!formData.meetingRoom.trim()) {
        Alert.alert('Error', 'Please enter a room number');
        return;
      }
    }
    
    // Validate online/hybrid meeting fields
    if (formData.meetingType === 'online' || formData.meetingType === 'hybrid') {
      if (!formData.meetingUrl.trim()) {
        Alert.alert('Error', 'Please enter a meeting URL');
        return;
      }
      // Basic URL validation
      if (!formData.meetingUrl.startsWith('http://') && !formData.meetingUrl.startsWith('https://')) {
        Alert.alert('Error', 'Please enter a valid meeting URL (must start with http:// or https://)');
        return;
      }
    }
    
    // If we get here, all validation passed
    onSubmit(formData);
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Study Group</Text>
          
          {/* Basic Group Info */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Group Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Topic *"
            value={formData.topic}
            onChangeText={(text) => setFormData({...formData, topic: text})}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description *"
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Capacity (minimum 2)"
            value={formData.capacity.toString()}
            onChangeText={(text) => setFormData({...formData, capacity: parseInt(text) || 10})}
            keyboardType="numeric"
          />
          
          {/* Group Settings */}
          <Text style={styles.sectionTitle}>Group Settings</Text>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Study Mode:</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity 
                style={[styles.pickerOption, formData.mode === 'collaborative' && styles.pickerOptionSelected]}
                onPress={() => setFormData({...formData, mode: 'collaborative'})}
              >
                <Text style={[styles.pickerOptionText, formData.mode === 'collaborative' && styles.pickerOptionTextSelected]}>
                  Collaborative
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerOption, formData.mode === 'quiet' && styles.pickerOptionSelected]}
                onPress={() => setFormData({...formData, mode: 'quiet'})}
              >
                <Text style={[styles.pickerOptionText, formData.mode === 'quiet' && styles.pickerOptionTextSelected]}>
                  Quiet Study
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Privacy:</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity 
                style={[styles.pickerOption, formData.privacy === 'public' && styles.pickerOptionSelected]}
                onPress={() => setFormData({...formData, privacy: 'public'})}
              >
                <Text style={[styles.pickerOptionText, formData.privacy === 'public' && styles.pickerOptionTextSelected]}>
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerOption, formData.privacy === 'private' && styles.pickerOptionSelected]}
                onPress={() => setFormData({...formData, privacy: 'private'})}
              >
                <Text style={[styles.pickerOptionText, formData.privacy === 'private' && styles.pickerOptionTextSelected]}>
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Meeting Details */}
          <Text style={styles.sectionTitle}>Meeting Details</Text>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Meeting Type:</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity 
                style={[styles.pickerOption, formData.meetingType === 'in-person' && styles.pickerOptionSelected]}
                onPress={() => setFormData({...formData, meetingType: 'in-person'})}
              >
                <Text style={[styles.pickerOptionText, formData.meetingType === 'in-person' && styles.pickerOptionTextSelected]}>
                  In-Person
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerOption, formData.meetingType === 'online' && styles.pickerOptionSelected]}
                onPress={() => setFormData({...formData, meetingType: 'online'})}
              >
                <Text style={[styles.pickerOptionText, formData.meetingType === 'online' && styles.pickerOptionTextSelected]}>
                  Online
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerOption, formData.meetingType === 'hybrid' && styles.pickerOptionSelected]}
                onPress={() => setFormData({...formData, meetingType: 'hybrid'})}
              >
                <Text style={[styles.pickerOptionText, formData.meetingType === 'hybrid' && styles.pickerOptionTextSelected]}>
                  Hybrid
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Date Picker */}
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeButtonText}>
              {formData.meetingDate ? `Date: ${formData.meetingDate}` : 'Select Meeting Date *'}
            </Text>
          </TouchableOpacity>
          
          {/* Time Picker */}
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeButtonText}>
              {formData.meetingTime ? `Time: ${formData.meetingTime}` : 'Select Meeting Time *'}
            </Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Meeting Duration (minutes) *"
            value={formData.meetingDuration.toString()}
            onChangeText={(text) => setFormData({...formData, meetingDuration: parseInt(text) || 60})}
            keyboardType="numeric"
          />
          
          {/* Location/URL based on meeting type */}
          {formData.meetingType === 'in-person' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Location (Building/Campus) *"
                value={formData.meetingLocation}
                onChangeText={(text) => setFormData({...formData, meetingLocation: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Room Number *"
                value={formData.meetingRoom}
                onChangeText={(text) => setFormData({...formData, meetingRoom: text})}
              />
            </>
          )}
          
          {(formData.meetingType === 'online' || formData.meetingType === 'hybrid') && (
            <TextInput
              style={styles.input}
              placeholder="Meeting URL (Zoom/Teams) *"
              value={formData.meetingUrl}
              onChangeText={(text) => setFormData({...formData, meetingUrl: text})}
              keyboardType="url"
              autoCapitalize="none"
            />
          )}
          
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  userInfo: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  clearSearch: {
    fontSize: 18,
    color: '#7f8c8d',
    padding: 5,
  },
  filterButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  getStartedButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  groupsContainer: {
    padding: 15,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#f39c12',
  },
  groupTopic: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 12,
  },
  meetingInfo: {
    fontSize: 14,
    color: '#27ae60',
    marginBottom: 8,
  },
  memberInfo: {
    fontSize: 14,
    color: '#e67e22',
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  memberBadge: {
    backgroundColor: '#27ae60',
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  ownerBadge: {
    backgroundColor: '#f39c12',
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  notification: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
  },
  notificationText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeText: {
    color: '#3498db',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 10,
    marginTop: 20,
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#ffffff',
    minWidth: 80,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  dateTimeButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
  },
});
