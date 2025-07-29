import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard, StyleSheet } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar';
import MessageList from './MessageList';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Feather } from '@expo/vector-icons';
import CustomKeyboardView from './CustomerKeyboardView';
import { getRoomId } from '../../utils/common';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import ChatRoomHeader from './ChatRoomHeader';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';

export default function ChatRoom() {
    const route = useRoute();
    const navigation = useNavigation();
    const item = route.params; // second user
    const { user } = useAuth(); // logged in user
    const [messages, setMessages] = useState([]);
    const textRef = useRef('');
    const inputRef = useRef(null);
    const scrollViewRef = useRef(null);

    useEffect(() => {
        createRoomIfNotExists();

        let roomId = getRoomId(user?.userId, item?.userId);
        const docRef = doc(db, "rooms", roomId);
        const messagesRef = collection(docRef, "messages");
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        let unsub = onSnapshot(q, (snapshot) => {
            let allMessages = snapshot.docs.map(doc => {
                return doc.data();
            });
            setMessages([...allMessages]);
        });

        const KeyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow', updateScrollView
        )

        return () => {
            unsub();
            KeyboardDidShowListener.remove();
        }

    }, []);

    useEffect(() => {
        updateScrollView();
    }, [messages])

    const updateScrollView = () => {
        setTimeout(() => {
            scrollViewRef?.current?.scrollToEnd({ animated: true })
        }, 100)
    }

    const createRoomIfNotExists = async () => {
        // roomId
        let roomId = getRoomId(user?.userId, item?.userId);
        await setDoc(doc(db, "rooms", roomId), {
            roomId,
            createdAt: Timestamp.fromDate(new Date())
        });
    }

    const hanldeSendMessage = async () => {
        let message = textRef.current.trim();
        if (!message) return;
        try {
            let roomId = getRoomId(user?.userId, item?.userId);
            const docRef = doc(db, 'rooms', roomId);
            const messagesRef = collection(docRef, "messages");
            textRef.current = "";
            if (inputRef) inputRef?.current?.clear();
            
            // Create message object with validation and fallback values
            const messageData = {
                userId: user?.userId || '',
                text: message,
                profileUrl: user?.profileUrl || null, // Use null instead of undefined
                senderName: user?.username || user?.name || 'Unknown User',
                createdAt: Timestamp.fromDate(new Date())
            };
            
            // Remove undefined values to prevent Firestore errors
            const cleanMessageData = Object.fromEntries(
                Object.entries(messageData).filter(([_, value]) => value !== undefined)
            );
            
            await addDoc(messagesRef, cleanMessageData);
        } catch (err) {
            Alert.alert('Message', err.message);
        }
    }

    return (
        <CustomKeyboardView inChat={true}>
            <View style={styles.container}>
                <StatusBar style="dark" />
                <ChatRoomHeader user={item} navigation={navigation} />
                <View style={styles.divider} />
                <View style={styles.chatArea}>
                    <View style={styles.messageList}>
                        <MessageList scrollViewRef={scrollViewRef} messages={messages} currentUser={user} />
                    </View>
                    <View style={styles.inputAreaWrapper}>
                        <View style={styles.inputArea}>
                            <TextInput
                                ref={inputRef}
                                onChangeText={value => textRef.current = value}
                                placeholder='Type message...'
                                placeholderTextColor={'gray'}
                                style={styles.textInput}
                            />
                            <TouchableOpacity onPress={hanldeSendMessage} style={styles.sendButton}>
                                <Feather name="send" size={hp(2.7)} color="#737373" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    divider: {
        height: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db', // neutral-300
    },
    chatArea: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#f3f4f6', // neutral-100
        overflow: 'visible',
    },
    messageList: {
        flex: 1,
    },
    inputAreaWrapper: {
        marginBottom: hp(2.7),
        paddingTop: 8,
    },
    inputArea: {
        flexDirection: 'row',
        marginHorizontal: 12,
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db', // neutral-300
        borderRadius: 999,
        padding: 8,
        paddingLeft: 20,
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        marginRight: 8,
        fontSize: hp(2),
        color: 'black',
    },
    sendButton: {
        backgroundColor: '#e5e7eb', // neutral-200
        padding: 8,
        marginRight: 1,
        borderRadius: 999,
    },
});
