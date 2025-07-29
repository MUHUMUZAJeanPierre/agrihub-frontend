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
import { useTheme } from '../../contexts/ThemeContext';

export default function ChatRoom() {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const item = route.params; // second user
    const { user } = useAuth(); // logged in user
    const [messages, setMessages] = useState([]);
    const textRef = useRef('');
    const inputRef = useRef(null);
    const scrollViewRef = useRef(null);

    // Dark mode colors
    const Colors = {
        background: theme === 'dark' ? '#121212' : '#FFFFFF',
        surface: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
        textPrimary: theme === 'dark' ? '#FFFFFF' : '#000000',
        textSecondary: theme === 'dark' ? '#B0B0B0' : '#666666',
        textTertiary: theme === 'dark' ? '#808080' : '#999999',
        borderColor: theme === 'dark' ? '#3A3A3A' : '#E0E0E0',
        cardBackground: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
        inputBackground: theme === 'dark' ? '#2C2C2C' : '#FFFFFF',
        chatArea: theme === 'dark' ? '#1A1A1A' : '#F3F4F6',
        divider: theme === 'dark' ? '#3A3A3A' : '#D1D5DB',
    };

    useEffect(() => {
        createRoomIfNotExists();

        // Get user IDs consistently
        const currentUserId = user?.uid || user?.userId;
        const otherUserId = item?.uid || item?.userId;
        
        if (!currentUserId || !otherUserId) return;
        
        let roomId = getRoomId(currentUserId, otherUserId);
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

    }, [user, item]);

    useEffect(() => {
        updateScrollView();
    }, [messages])

    const updateScrollView = () => {
        setTimeout(() => {
            scrollViewRef?.current?.scrollToEnd({ animated: true })
        }, 100)
    }

    const createRoomIfNotExists = async () => {
        // Get user IDs consistently
        const currentUserId = user?.uid || user?.userId;
        const otherUserId = item?.uid || item?.userId;
        
        if (!currentUserId || !otherUserId) return;
        
        let roomId = getRoomId(currentUserId, otherUserId);
        await setDoc(doc(db, "rooms", roomId), {
            roomId,
            createdAt: Timestamp.fromDate(new Date())
        });
    }

    const hanldeSendMessage = async () => {
        let message = textRef.current.trim();
        if (!message) return;
        try {
            // Get user IDs consistently
            const currentUserId = user?.uid || user?.userId;
            const otherUserId = item?.uid || item?.userId;
            
            if (!currentUserId || !otherUserId) {
                Alert.alert('Error', 'User information not available');
                return;
            }
            
            let roomId = getRoomId(currentUserId, otherUserId);
            const docRef = doc(db, 'rooms', roomId);
            const messagesRef = collection(docRef, "messages");
            textRef.current = "";
            if (inputRef) inputRef?.current?.clear();
            
            // Create message object with validation and fallback values
            const messageData = {
                userId: currentUserId,
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
            <View style={[styles.container, { backgroundColor: Colors.background }]}>
                <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
                <ChatRoomHeader user={item} navigation={navigation} theme={theme} />
                <View style={[styles.divider, { borderBottomColor: Colors.divider }]} />
                <View style={[styles.chatArea, { backgroundColor: Colors.chatArea }]}>
                    <View style={styles.messageList}>
                        <MessageList scrollViewRef={scrollViewRef} messages={messages} currentUser={user} theme={theme} />
                    </View>
                    <View style={styles.inputAreaWrapper}>
                        <View style={[styles.inputArea, { 
                            backgroundColor: Colors.inputBackground,
                            borderColor: Colors.borderColor 
                        }]}>
                            <TextInput
                                ref={inputRef}
                                onChangeText={value => textRef.current = value}
                                placeholder='Type message...'
                                placeholderTextColor={Colors.textTertiary}
                                style={[styles.textInput, { color: Colors.textPrimary }]}
                            />
                            <TouchableOpacity onPress={hanldeSendMessage} style={styles.sendButton}>
                                <Feather name="send" size={hp(2.7)} color={Colors.textTertiary} />
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
    },
    divider: {
        height: 3,
        borderBottomWidth: 1,
    },
    chatArea: {
        flex: 1,
        justifyContent: 'space-between',
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
        borderWidth: 1,
        borderRadius: 999,
        padding: 8,
        paddingLeft: 20,
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        marginRight: 8,
        fontSize: hp(2),
    },
    sendButton: {
        backgroundColor: '#e5e7eb', // neutral-200
        padding: 8,
        marginRight: 1,
        borderRadius: 999,
    },
});
