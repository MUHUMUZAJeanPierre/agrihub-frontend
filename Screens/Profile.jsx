// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';
// import { useTheme } from '../contexts/ThemeContext'; // Update path as needed

// const AUTH_KEYS = {
//   TOKEN: '@auth_token',
//   USER_ID: '@user_id',
//   USER_DATA: '@user_data',
// };

// const ProfileScreen = () => {
//   const navigation = useNavigation();
//   const [user, setUser] = useState(null);
//   const { theme, toggleTheme } = useTheme();
//   const isDark = theme === 'dark';

//   const loadUserData = async () => {
//     try {
//       const userData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);
//       if (userData) {
//         const parsedUser = JSON.parse(userData);
//         setUser({
//           name: parsedUser.name,
//           email: parsedUser.email,
//           avatar: parsedUser.avatar || 'https://via.placeholder.com/150',
//           phone: parsedUser.phone || 'N/A',
//         });
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   const handleLogout = async () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Logout',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             await AsyncStorage.multiRemove([
//               AUTH_KEYS.TOKEN,
//               AUTH_KEYS.USER_ID,
//               AUTH_KEYS.USER_DATA,
//             ]);
//             navigation.reset({
//               index: 0,
//               routes: [{ name: 'login' }],
//             });
//           } catch (err) {
//             console.error('Logout error:', err);
//           }
//         },
//       },
//     ]);
//   };

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const menuItems = [
//     { id: '1', title: 'Edit Profile', icon: 'person-outline' },
//     { id: '2', title: 'Address Book', icon: 'location-outline' },
//     { id: '3', title: 'Payment Methods', icon: 'card-outline' },
//     { id: '4', title: 'Notifications', icon: 'notifications-outline' },
//     { id: '5', title: 'Security', icon: 'shield-outline' },
//     { id: '6', title: 'Help & Support', icon: 'help-circle-outline' },
//     { id: '7', title: 'Privacy Policy', icon: 'document-text-outline' },
//     { id: '8', title: 'Terms of Service', icon: 'clipboard-outline' },
//   ];

//   const renderMenuItem = (item) => (
//     <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => Alert.alert(item.title)}>
//       <View style={styles.menuItemLeft}>
//         <Ionicons name={item.icon} size={24} color={isDark ? '#ccc' : '#666'} />
//         <Text style={[styles.menuItemText, { color: isDark ? '#ccc' : '#333' }]}>{item.title}</Text>
//       </View>
//       <Ionicons name="chevron-forward" size={20} color={isDark ? '#ccc' : '#666'} />
//     </TouchableOpacity>
//   );

//   if (!user) {
//     return (
//       <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
//         <Text style={{ textAlign: 'center', marginTop: 100, color: isDark ? '#fff' : '#000' }}>
//           Loading profile...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={styles.header}>
//           <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>Profile</Text>
//         </View>

//         <View style={styles.profileSection}>
//           <View style={styles.avatarContainer}>
//             <Image source={{ uri: user.avatar }} style={styles.avatar} />
//             <TouchableOpacity style={styles.editAvatarButton}>
//               <Ionicons name="camera" size={16} color="#fff" />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.userInfo}>
//             <Text style={[styles.userName, { color: isDark ? '#fff' : '#333' }]}>{user.name}</Text>
//             <Text style={[styles.userEmail, { color: isDark ? '#aaa' : '#666' }]}>{user.email}</Text>
//             <Text style={[styles.userPhone, { color: isDark ? '#aaa' : '#666' }]}>{user.phone}</Text>
//           </View>
//         </View>

//         <View style={[styles.statsSection, { backgroundColor: isDark ? '#111' : '#f8f8f8' }]}>
//           <View style={styles.statItem}>
//             <Text style={[styles.statNumber, { color: '#4CAF50' }]}>12</Text>
//             <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Orders</Text>
//           </View>
//           <View style={styles.statDivider} />
//           <View style={styles.statItem}>
//             <Text style={[styles.statNumber, { color: '#4CAF50' }]}>5</Text>
//             <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Reviews</Text>
//           </View>
//           <View style={styles.statDivider} />
//           <View style={styles.statItem}>
//             <Text style={[styles.statNumber, { color: '#4CAF50' }]}>3</Text>
//             <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Wishlist</Text>
//           </View>
//         </View>

//         <View style={styles.menuSection}>{menuItems.map(renderMenuItem)}</View>

//         <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
//           <TouchableOpacity onPress={toggleTheme} style={[styles.logoutButton, { backgroundColor: isDark ? '#444' : '#eee' }]}>
//             <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={isDark ? '#fff' : '#000'} />
//             <Text style={[styles.logoutText, { color: isDark ? '#fff' : '#000' }]}>
//               Switch to {isDark ? 'Light' : 'Dark'} Mode
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.logoutSection}>
//           <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//             <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
//             <Text style={styles.logoutText}>Logout</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.versionSection}>
//           <Text style={[styles.versionText, { color: isDark ? '#888' : '#999' }]}>Version 1.0.0</Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   title: { fontSize: 24, fontWeight: 'bold' },
//   profileSection: {
//     alignItems: 'center',
//     paddingVertical: 30,
//     paddingHorizontal: 20,
//   },
//   avatarContainer: { position: 'relative', marginBottom: 15 },
//   avatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: '#f0f0f0',
//   },
//   editAvatarButton: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: '#4CAF50',
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: '#fff',
//   },
//   userInfo: { alignItems: 'center' },
//   userName: { fontSize: 24, fontWeight: 'bold' },
//   userEmail: { fontSize: 16 },
//   userPhone: { fontSize: 14 },
//   statsSection: {
//     flexDirection: 'row',
//     marginHorizontal: 20,
//     borderRadius: 10,
//     paddingVertical: 20,
//     marginBottom: 20,
//   },
//   statItem: { flex: 1, alignItems: 'center' },
//   statNumber: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
//   statLabel: { fontSize: 12, textTransform: 'uppercase' },
//   statDivider: { width: 1, backgroundColor: '#ddd', marginVertical: 10 },
//   menuSection: { paddingHorizontal: 20 },
//   menuItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
//   menuItemText: { fontSize: 16, marginLeft: 15 },
//   logoutSection: { paddingHorizontal: 20, paddingVertical: 20 },
//   logoutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 15,
//     borderRadius: 10,
//     backgroundColor: '#FF3B3020',
//   },
//   logoutText: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 10,
//   },
//   versionSection: { alignItems: 'center', paddingVertical: 20 },
//   versionText: { fontSize: 12 },
// });

// export default ProfileScreen;


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

// Color Schemes
const LightColors = {
  primary: '#4A90E2',
  primaryDark: '#2D5AA0',
  secondary: '#FF6B35',
  accent: '#FFA726',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceLight: '#F0F0F0',
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  cardBackground: '#FFFFFF',
  inputBackground: '#F5F5F5',
  borderColor: '#E0E0E0',
  gradient: ['#4A90E2', '#357ABD'],
  orangeGradient: ['#FF6B35', '#FF8A50'],
};

const DarkColors = {
  primary: '#4A90E2',
  primaryDark: '#2D5AA0',
  secondary: '#FF6B35',
  accent: '#FFA726',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2C2C2C',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  cardBackground: '#1A1A1A',
  inputBackground: '#2C2C2C',
  borderColor: '#3A3A3A',
  gradient: ['#4A90E2', '#357ABD'],
  orangeGradient: ['#FF6B35', '#FF8A50'],
};

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const Colors = theme === 'dark' ? DarkColors : LightColors;

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: parsedUser.name,
          email: parsedUser.email,
          avatar: parsedUser.avatar || 'https://via.placeholder.com/150',
          phone: parsedUser.phone || 'N/A',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              AUTH_KEYS.TOKEN,
              AUTH_KEYS.USER_ID,
              AUTH_KEYS.USER_DATA,
            ]);
            navigation.reset({
              index: 0,
              routes: [{ name: 'login' }],
            });
          } catch (err) {
            console.error('Logout error:', err);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Simplified menu items - only keeping Edit Profile
  const menuItems = [
    { id: '1', title: 'Edit Profile', icon: 'person-outline', onPress: () => Alert.alert('Edit Profile', 'Edit profile functionality coming soon!') },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity key={item.id} style={[styles.menuItem, { backgroundColor: Colors.cardBackground, borderBottomColor: Colors.borderColor }]} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: Colors.surfaceLight }]}>
          <Ionicons name={item.icon} size={20} color={Colors.primary} />
        </View>
        <Text style={[styles.menuItemText, { color: Colors.textPrimary }]}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="person-circle-outline" size={60} color={Colors.textTertiary} />
          <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: Colors.cardBackground, borderBottomColor: Colors.borderColor }]}>
          <Text style={[styles.title, { color: Colors.textPrimary }]}>Profile</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={[styles.avatar, { backgroundColor: Colors.surfaceLight }]} />
            <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: Colors.success }]}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: Colors.textPrimary }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: Colors.textSecondary }]}>{user.email}</Text>
            <Text style={[styles.userPhone, { color: Colors.textTertiary }]}>{user.phone}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={[styles.statsSection, { backgroundColor: Colors.cardBackground }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>12</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Orders</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: Colors.borderColor }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>5</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Reviews</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: Colors.borderColor }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>3</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Wishlist</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Theme Toggle */}
        <View style={styles.themeSection}>
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.themeButton, { backgroundColor: Colors.cardBackground, borderColor: Colors.borderColor }]}
          >
            <View style={[styles.themeIconContainer, { backgroundColor: Colors.surfaceLight }]}>
              <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={22} color={Colors.primary} />
            </View>
            <View style={styles.themeTextContainer}>
              <Text style={[styles.themeTitle, { color: Colors.textPrimary }]}>
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </Text>
              <Text style={[styles.themeSubtitle, { color: Colors.textTertiary }]}>
                Switch to {theme === 'dark' ? 'light' : 'dark'} theme
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: Colors.error + '15' }]} 
            onPress={handleLogout}
          >
            <View style={[styles.logoutIconContainer, { backgroundColor: Colors.error + '20' }]}>
              <Ionicons name="log-out-outline" size={24} color={Colors.error} />
            </View>
            <Text style={[styles.logoutText, { color: Colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Version Section */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: Colors.textTertiary }]}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Poppins_400Regular',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: { 
    position: 'relative', 
    marginBottom: 20 
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: { 
    alignItems: 'center' 
  },
  userName: { 
    fontSize: 26, 
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  userEmail: { 
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 4,
  },
  userPhone: { 
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: 28, 
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  statLabel: { 
    fontSize: 12, 
    textTransform: 'uppercase',
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.5,
  },
  statDivider: { 
    width: 1, 
    marginVertical: 10 
  },
  menuSection: { 
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: { 
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  themeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 2,
  },
  themeSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  logoutSection: { 
    paddingHorizontal: 20, 
    paddingVertical: 20 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  versionSection: { 
    alignItems: 'center', 
    paddingVertical: 20 
  },
  versionText: { 
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
});

export default ProfileScreen;
