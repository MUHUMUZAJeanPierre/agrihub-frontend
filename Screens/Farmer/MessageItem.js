import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function MessageItem({ message, currentUser }) {
  if (currentUser?.userId == message?.userId) {
    // my message
    return (
      <View style={styles.myMessageRow}>
        <View style={styles.messageWidth}>
          <View style={styles.myMessageBubble}>
            <Text style={styles.messageText}>
              {message?.text}
            </Text>
          </View>
        </View>
      </View>
    )
  } else {
    return (
      <View style={[styles.messageWidth, styles.otherMessageRow]}>
        <View style={styles.otherMessageBubble}>
          <Text style={styles.messageText}>
            {message?.text}
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  myMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12, // mb-3
    marginRight: 12,  // mr-3
  },
  otherMessageRow: {
    marginLeft: 12,   // ml-3
    marginBottom: 12, // mb-3
  },
  messageWidth: {
    width: wp(80),
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
    padding: 12,      // p-3
    paddingHorizontal: 16, // px-4
    borderRadius: 16, // rounded-2xl
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-neutral-200
  },
  otherMessageBubble: {
    alignSelf: 'flex-start',
    padding: 12,      // p-3
    paddingHorizontal: 16, // px-4
    borderRadius: 16, // rounded-2xl
    backgroundColor: '#c7d2fe', // indigo-100
    borderWidth: 1,
    borderColor: '#a5b4fc', // indigo-200
  },
  messageText: {
    fontSize: hp(1.9),
  },
});