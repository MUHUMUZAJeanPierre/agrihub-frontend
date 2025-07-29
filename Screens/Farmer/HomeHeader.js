// import { View, Text, ScrollView, StyleSheet } from 'react-native'
// import React from 'react'
// import MessageItem from './MessageItem'

// export default function MessageList({ messages, scrollViewRef, currentUser }) {
//   return (
//     <ScrollView
//       ref={scrollViewRef}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.container}
//     >
//       {
//         messages.map((message, index) => (
//           <MessageItem message={message} key={index} currentUser={currentUser} />
//         ))
//       }
//     </ScrollView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     paddingTop: 10,
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

const ios = Platform.OS === 'ios';

export default function HomeHeader() {
  const { user, logout } = useAuth();
  const { top } = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

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
      <Text style={styles.headerText}>Chats</Text>

      <TouchableOpacity onPress={() => setMenuVisible(true)}>
        <Image
          source={{ uri: user?.profileUrl || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* Simple dropdown menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOptions}>
            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50', // Indigo
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    fontSize: 24,
    fontWeight: '500',
    color: 'white',
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderColor:'rgba(0, 0, 0, 0.95)',
    borderWidth:2
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuOptions: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 8,
    width: 160,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 4,
  },
});
