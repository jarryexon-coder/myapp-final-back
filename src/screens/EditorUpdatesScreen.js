import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  Timestamp,
  limit,
  startAfter,
  where,
  getDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Initialize Firebase
import { app } from '../../firebaseConfig'; // Adjust path as needed

const db = getFirestore(app);
const auth = getAuth(app);

const EditorUpdatesScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [readStatus, setReadStatus] = useState({});
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch user on component mount
  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);
  }, []);

  // Fetch updates from Firestore
  const fetchUpdates = async (isRefresh = false) => {
    try {
      setLoading(true);
      
      // Query updates ordered by date (newest first)
      const updatesRef = collection(db, 'editor_updates');
      let q = query(
        updatesRef,
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      
      const updatesData = [];
      let lastDoc = null;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        updatesData.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to date string
          date: formatDate(data.createdAt),
          // Parse createdAt if it's a Firestore timestamp
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        });
        lastDoc = doc;
      });

      // Fetch user's read status if logged in
      if (user) {
        await fetchReadStatus();
      }

      if (isRefresh) {
        setUpdates(updatesData);
      } else {
        setUpdates(updatesData);
      }
      
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === 20);
    } catch (error) {
      console.error('Error fetching updates:', error);
      // Fallback to sample data if Firestore fails
      if (updates.length === 0) {
        setUpdates(getSampleUpdates());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch user's read status from Firestore
  const fetchReadStatus = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setReadStatus(userData.readUpdates || {});
      }
    } catch (error) {
      console.error('Error fetching read status:', error);
    }
  };

  // Format date to display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Fetch initial data
  useFocusEffect(
    React.useCallback(() => {
      fetchUpdates();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUpdates(true);
  };

  // Mark update as read
  const markAsRead = async (id) => {
    // Update local state immediately for better UX
    const updatedReadStatus = { ...readStatus, [id]: true };
    setReadStatus(updatedReadStatus);

    // Update in Firestore if user is logged in
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          readUpdates: updatedReadStatus,
        });
      } catch (error) {
        console.error('Error updating read status:', error);
      }
    }
  };

  // Load more updates (for pagination)
  const loadMore = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      const updatesRef = collection(db, 'editor_updates');
      let q = query(
        updatesRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      
      const newUpdates = [];
      let lastDoc = null;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        newUpdates.push({
          id: doc.id,
          ...data,
          date: formatDate(data.createdAt),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        });
        lastDoc = doc;
      });

      setUpdates([...updates, ...newUpdates]);
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === 10);
    } catch (error) {
      console.error('Error loading more updates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Admin function to add new update (can be moved to separate admin screen)
  const addNewUpdate = async (updateData) => {
    try {
      const updatesRef = collection(db, 'editor_updates');
      const newUpdate = {
        ...updateData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(updatesRef, newUpdate);
      console.log('Update added with ID:', docRef.id);
      
      // Refresh the updates list
      fetchUpdates(true);
    } catch (error) {
      console.error('Error adding update:', error);
    }
  };

  // Calculate unread count
  const unreadCount = updates.filter(update => !readStatus[update.id]).length;

  const renderHeader = () => (
    <LinearGradient
      colors={['#7c3aed', '#8b5cf6']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Editor's Updates</Text>
          <Text style={styles.headerSubtitle}>Latest features & announcements</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  const renderUpdateCard = (update) => {
    const isRead = readStatus[update.id] || false;
    
    return (
      <TouchableOpacity 
        key={update.id}
        style={[
          styles.updateCard,
          !isRead && styles.unreadCard
        ]}
        onPress={() => markAsRead(update.id)}
        activeOpacity={0.7}
      >
        <View style={styles.updateHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: update.color + '20' }]}>
            <Ionicons name={update.icon} size={14} color={update.color} />
            <Text style={[styles.categoryText, { color: update.color }]}>
              {update.category}
            </Text>
          </View>
          <Text style={styles.dateText}>{update.date}</Text>
        </View>
        
        <View style={styles.updateContent}>
          <Text style={styles.updateTitle}>{update.title}</Text>
          <Text style={styles.updateDescription}>{update.description}</Text>
        </View>
        
        {!isRead && (
          <View style={styles.unreadIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  // Sample data for fallback
  const getSampleUpdates = () => [
    {
      id: '1',
      title: 'New NBA Analytics Dashboard',
      description: 'We\'ve launched a new analytics dashboard with real-time player tracking and advanced metrics.',
      date: 'Today',
      category: 'Feature',
      icon: 'analytics',
      color: '#3b82f6',
    },
    {
      id: '2',
      title: 'Live Game Tracking Enhanced',
      description: 'Our live game tracking now includes player efficiency ratings and advanced shot charts.',
      date: 'Yesterday',
      category: 'Update',
      icon: 'pulse',
      color: '#ef4444',
    },
  ];

  if (loading && updates.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading updates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
          
          if (isCloseToBottom && hasMore) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.updatesContainer}>
          {updates.length > 0 ? (
            updates.map(update => renderUpdateCard(update))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No updates yet</Text>
              <Text style={styles.emptySubtext}>Check back soon for announcements</Text>
            </View>
          )}
        </View>
        
        {loading && updates.length > 0 && (
          <ActivityIndicator style={styles.loadingMore} color="#7c3aed" />
        )}
        
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#3b82f6" />
            <Text style={styles.infoTitle}>About Updates</Text>
            <Text style={styles.infoText}>
              We regularly release new features and improvements. Check back here for the latest announcements.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#3b82f6" />
            <Text style={styles.feedbackButtonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>App Version 1.2.0</Text>
          <Text style={styles.footerSubtext}>Last updated: {formatDate(new Date())}</Text>
        </View>
      </ScrollView>
      
      {/* Admin Add Button (Remove in production or secure properly) */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('AdminUpdateScreen')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// Example Admin Screen Component (create separate file)
const AdminUpdateScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Feature');
  const [icon, setIcon] = useState('megaphone');
  const [color, setColor] = useState('#3b82f6');
  
  const categories = [
    { label: 'Feature', value: 'Feature', icon: 'rocket', color: '#3b82f6' },
    { label: 'Update', value: 'Update', icon: 'refresh', color: '#ef4444' },
    { label: 'Bug Fix', value: 'Bug Fix', icon: 'bug', color: '#10b981' },
    { label: 'Announcement', value: 'Announcement', icon: 'megaphone', color: '#f59e0b' },
    { label: 'Maintenance', value: 'Maintenance', icon: 'construct', color: '#8b5cf6' },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    
    const updateData = {
      title: title.trim(),
      description: description.trim(),
      category,
      icon,
      color,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    try {
      const updatesRef = collection(db, 'editor_updates');
      await addDoc(updatesRef, updateData);
      
      // Clear form
      setTitle('');
      setDescription('');
      setCategory('Feature');
      
      navigation.goBack();
    } catch (error) {
      console.error('Error adding update:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Update</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter update title"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter update description"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryOption,
                    category === cat.value && { backgroundColor: cat.color + '20' }
                  ]}
                  onPress={() => {
                    setCategory(cat.value);
                    setIcon(cat.icon);
                    setColor(cat.color);
                  }}
                >
                  <Ionicons
                    name={cat.icon}
                    size={20}
                    color={category === cat.value ? cat.color : '#64748B'}
                  />
                  <Text style={[
                    styles.categoryOptionText,
                    category === cat.value && { color: cat.color }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={!title.trim() || !description.trim()}
          >
            <Text style={styles.submitButtonText}>Publish Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  updatesContainer: {
    padding: 20,
  },
  updateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  updateContent: {
    marginBottom: 8,
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  updateDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  feedbackButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
  },
  loadingMore: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  adminButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#7c3aed',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  // Admin screen styles
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryOptionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#64748B',
  },
  submitButton: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditorUpdatesScreen;
