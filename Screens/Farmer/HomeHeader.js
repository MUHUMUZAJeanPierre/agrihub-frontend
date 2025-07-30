import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ios = Platform.OS === 'ios';

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

export default function HomeHeader() {
  const { user, logout } = useAuth();
  const { top } = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [person, setPerson] = useState(null); // Start with null instead of default values

  const loadUserData = async () => {
    try {
      // First check if we have user data in AsyncStorage
      const userData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);
      console.log('AsyncStorage userData:', userData); // Debug log
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user data:', parsedUser); // Debug log
        setPerson(parsedUser);
      } else {
        console.log('No user data in AsyncStorage, using auth context user'); // Debug log
        // If no AsyncStorage data, use the user from auth context
        setPerson(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to auth context user if AsyncStorage fails
      setPerson(user);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]); // Also depend on user changes

  // Use either person data or user data, with final fallbacks
  const displayUser = person || user || {};
  const displayName = displayUser.name || displayUser.displayName || 'Guest';
  const displayEmail = displayUser.email || 'No email provided';
  const displayAvatar = displayUser.avatar || displayUser.profileUrl || 'https://via.placeholder.com/150';

  const handleProfile = () => {
    setMenuVisible(false);
    // Navigate to profile screen if needed
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: ios ? top : top + 10 }]}>
      {/* Background gradient effect */}
      <View style={styles.gradientOverlay} />
      
      {/* Header content */}
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <Text style={styles.headerText}>Chats</Text>
          <Text style={styles.subtitleText}>Stay connected</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.profileImageWrapper}>
            <Image
              source={{ uri: displayAvatar }}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Enhanced dropdown menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Image
                source={{ uri: displayAvatar }}
                style={styles.menuProfileImage}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.userEmail}>{displayEmail}</Text>
              </View>
            </View>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <View style={styles.menuIcon}>
                <Text style={styles.iconText}>👤</Text>
              </View>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuIcon}>
                <Text style={styles.iconText}>🚪</Text>
              </View>
              <Text style={[styles.menuText, styles.logoutText]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  titleSection: {
    flex: 1,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '400',
  },
  profileContainer: {
    padding: 2,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    height: 44,
    width: 44,
    borderRadius: 22,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 24,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 12,
    width: 220,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#6b7280',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  logoutText: {
    color: '#ef4444',
  },
});