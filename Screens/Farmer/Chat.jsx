import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { usersRef } from '../../firebase';
import HomeHeader from './HomeHeader';
import ChatItem from './ChatItem';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Chat() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = snapshot.docs
        .map(doc => ({ ...doc.data(), userId: doc.data().uid || doc.data().userId }))
        .filter(u => {
          // Filter out current user using multiple possible ID fields
          const currentUserId = user.uid || user.userId;
          const otherUserId = u.uid || u.userId;
          return otherUserId && otherUserId !== currentUserId;
        }); 

      setUsers(fetchedUsers);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <HomeHeader />
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item, index) => (item.uid || item.userId || index).toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <ChatItem
                item={item}
                index={index}
                noBorder={index + 1 === users.length}
                navigation={navigation}
                currentUser={user}
              />
            )}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 25,
  },
  loadingContainer: {
    alignItems: 'center',
    top: hp(30),
  },
});