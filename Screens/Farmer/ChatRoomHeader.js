import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';

export default function ChatRoomHeader({ user, navigation }) {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Entypo name="chevron-left" size={hp(4)} color="#737373" />
        </TouchableOpacity>
        <View style={styles.userInfoContainer}>
          <Image
            source={user?.profileUrl}
            style={styles.profileImage}
          />
          <Text style={styles.username}>
            {user?.username}
          </Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Ionicons name="call" size={hp(2.8)} color={'#737373'} />
        <Ionicons name="videocam" size={hp(2.8)} color={'#737373'} />
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
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
    color: '#374151', // text-neutral-700
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32, // gap-8 (8 * 4px)
  },
});