import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ChatItem({ item, navigation, noBorder, currentUser }) {
  const [lastMessage, setLastMessage] = useState(undefined);

  const blurhash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'; 

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();
    const options = isToday
      ? { hour: '2-digit', minute: '2-digit' }
      : { month: 'short', day: 'numeric' };
    return date.toLocaleString('en-US', options);
  };

  const getRoomId = (id1, id2) => {
    return [id1, id2].sort().join('-');
  };

  useEffect(() => {
    // Get user IDs consistently
    const currentUserId = currentUser?.uid || currentUser?.userId;
    const otherUserId = item?.uid || item?.userId;
    
    if (!currentUserId || !otherUserId) return;
    
    const roomId = getRoomId(currentUserId, otherUserId);
    const docRef = doc(db, 'rooms', roomId);
    const messagesRef = collection(docRef, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => doc.data());
      setLastMessage(allMessages[0] || null);
    });

    return unsub;
  }, [currentUser, item]);

  const openChatRoom = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('chatRoom', item);
    }
  };

  const renderTime = () => {
    if (lastMessage?.createdAt?.seconds) {
      const date = new Date(lastMessage.createdAt.seconds * 1000);
      return formatDate(date);
    }
  };

  const renderLastMessage = () => {
    if (typeof lastMessage === 'undefined') return 'Loading...';
    if (lastMessage) {
      const currentUserId = currentUser?.uid || currentUser?.userId;
      if (currentUserId === lastMessage?.userId) return 'You: ' + lastMessage?.text;
      return lastMessage?.text;
    } else {
      return 'Say Hi 👋';
    }
  };

  return (
    <TouchableOpacity
      onPress={openChatRoom}
      style={[
        styles.container,
        !noBorder && styles.borderBottom,
      ]}
    >
      <Image
        style={styles.profileImage}
        source={item?.profileUrl}
        placeholder={blurhash}
        transition={500}
      />

      <View style={styles.textContainer}>
        <View style={styles.header}>
          <Text style={styles.username}>
            {item?.name || item?.username || "Unknown User"}
          </Text>
          <Text style={styles.time}>
            {renderTime() || "Time not available"}
          </Text>
        </View>
        <Text style={styles.lastMessage}>
          {renderLastMessage() || "No message available"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: wp(4),
    marginBottom: hp(1.2),
    paddingBottom: hp(0.5),
    gap: wp(3),
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5', // neutral-200
  },
  profileImage: {
    height: hp(6),
    width: hp(6),
    borderRadius: 100,
  },
  textContainer: {
    flex: 1,
    gap: hp(0.5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: '#262626', // text-neutral-800
  },
  time: {
    fontSize: hp(1.6),
    fontWeight: '500',
    color: '#737373', // text-neutral-500
  },
  lastMessage: {
    fontSize: hp(1.6),
    fontWeight: '500',
    color: '#737373',
  },
});