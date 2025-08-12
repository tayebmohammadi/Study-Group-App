/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
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
  userStatus?: {
    isOwner: boolean;
    isMember: boolean;
    isFavorited: boolean;
    hasRequested: boolean;
    isWaitlisted: boolean;
  };
}

function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  // Check if user is logged in on app start
  useEffect(() => {
    // For now, we'll simulate a logged-in user
    // Later we'll add proper authentication
    const mockUser: User = {
      _id: 'mock-user-id',
      name: 'Test User',
      email: 'test@dartmouth.edu'
    };
    setUser(mockUser);
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      Alert.alert('Error', 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
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
      
      // Refresh groups
      await fetchGroups();
      Alert.alert('Success', response.data.message);
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const renderGroupCard = (group: Group) => (
    <View key={group._id} style={styles.groupCard}>
      <Text style={styles.groupName}>{group.name}</Text>
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
    switch (activeTab) {
      case 'available':
        const availableGroups = groups.filter(group => 
          !group.userStatus?.isMember && !group.userStatus?.isOwner
        );
        return availableGroups.map(renderGroupCard);
      
      case 'my-groups':
        const myGroups = groups.filter(group => 
          group.userStatus?.isMember || group.userStatus?.isOwner
        );
        return myGroups.map(renderGroupCard);
      
      case 'favorites':
        const favoriteGroups = groups.filter(group => 
          group.userStatus?.isFavorited
        );
        return favoriteGroups.map(renderGroupCard);
      
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
        {user && (
          <Text style={styles.userInfo}>Welcome, {user.name}!</Text>
        )}
      </View>

      {/* Tab Navigation */}
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

      {/* Content */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading groups...</Text>
          </View>
        ) : (
          <View style={styles.groupsContainer}>
            {renderTabContent()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  userInfo: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
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
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
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
});

export default App;
