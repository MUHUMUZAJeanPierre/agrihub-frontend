import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';

export default function ChatRoomHeader({ user, navigation, theme }) {
  // Dark mode colors
  const Colors = {
    background: theme === 'dark' ? '#121212' : '#FFFFFF',
    surface: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    textPrimary: theme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: theme === 'dark' ? '#B0B0B0' : '#666666',
    textTertiary: theme === 'dark' ? '#808080' : '#999999',
    borderColor: theme === 'dark' ? '#3A3A3A' : '#E0E0E0',
    cardBackground: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
  };

  return (
    <View style={[styles.header, { 
      backgroundColor: Colors.background,
      borderBottomColor: Colors.borderColor 
    }]}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Entypo name="chevron-left" size={hp(4)} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.userInfoContainer}>
          <Image
            source={user?.profileUrl}
            style={styles.profileImage}
          />
          <Text style={[styles.username, { color: Colors.textPrimary }]}>
            {user?.username}
          </Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Ionicons name="call" size={hp(2.8)} color={Colors.textSecondary} />
        <Ionicons name="videocam" size={hp(2.8)} color={Colors.textSecondary} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // gap-4 (4 * 4px)
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-3 (3 * 4px)
  },
  profileImage: {
    height: hp(4.5),
    aspectRatio: 1,
    borderRadius: 100,
  },
  username: {
    fontSize: hp(2.5),
    fontWeight: '500', // font-medium
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32, // gap-8 (8 * 4px)
  },
});