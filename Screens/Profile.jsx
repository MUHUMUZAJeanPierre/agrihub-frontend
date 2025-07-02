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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext'; // Update path as needed

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

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

  const menuItems = [
    { id: '1', title: 'Edit Profile', icon: 'person-outline' },
    { id: '2', title: 'Address Book', icon: 'location-outline' },
    { id: '3', title: 'Payment Methods', icon: 'card-outline' },
    { id: '4', title: 'Notifications', icon: 'notifications-outline' },
    { id: '5', title: 'Security', icon: 'shield-outline' },
    { id: '6', title: 'Help & Support', icon: 'help-circle-outline' },
    { id: '7', title: 'Privacy Policy', icon: 'document-text-outline' },
    { id: '8', title: 'Terms of Service', icon: 'clipboard-outline' },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => Alert.alert(item.title)}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={24} color={isDark ? '#ccc' : '#666'} />
        <Text style={[styles.menuItemText, { color: isDark ? '#ccc' : '#333' }]}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDark ? '#ccc' : '#666'} />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={{ textAlign: 'center', marginTop: 100, color: isDark ? '#fff' : '#000' }}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: isDark ? '#fff' : '#333' }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: isDark ? '#aaa' : '#666' }]}>{user.email}</Text>
            <Text style={[styles.userPhone, { color: isDark ? '#aaa' : '#666' }]}>{user.phone}</Text>
          </View>
        </View>

        <View style={[styles.statsSection, { backgroundColor: isDark ? '#111' : '#f8f8f8' }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>12</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>5</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>3</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Wishlist</Text>
          </View>
        </View>

        <View style={styles.menuSection}>{menuItems.map(renderMenuItem)}</View>

        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.logoutButton, { backgroundColor: isDark ? '#444' : '#eee' }]}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.logoutText, { color: isDark ? '#fff' : '#000' }]}>
              Switch to {isDark ? 'Light' : 'Dark'} Mode
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: isDark ? '#888' : '#999' }]}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: { alignItems: 'center' },
  userName: { fontSize: 24, fontWeight: 'bold' },
  userEmail: { fontSize: 16 },
  userPhone: { fontSize: 14 },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 20,
    marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  statLabel: { fontSize: 12, textTransform: 'uppercase' },
  statDivider: { width: 1, backgroundColor: '#ddd', marginVertical: 10 },
  menuSection: { paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: 16, marginLeft: 15 },
  logoutSection: { paddingHorizontal: 20, paddingVertical: 20 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#FF3B3020',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  versionSection: { alignItems: 'center', paddingVertical: 20 },
  versionText: { fontSize: 12 },
});

export default ProfileScreen;
