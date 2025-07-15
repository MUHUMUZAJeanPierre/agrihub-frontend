import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

const SOCKET_URL = "https://agrihub-backend-4z99.onrender.com";
const API_URL = "https://agrihub-backend-4z99.onrender.com/api/chats";

export default function AgronomeChat({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const [socket, setSocket] = useState(null);
  const flatListRef = useRef(null);

  // Get recipient ID from route params
  useEffect(() => {
    const recipient = route?.params?.recipientId || route?.params?.farmerId;
    if (recipient) {
      setRecipientId(recipient);
    }
  }, [route]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user._id || user.id);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!userId || !recipientId) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log("Agronome socket connected");
      
      // Join personal room
      newSocket.emit('join_room', { 
        roomId: `user_${userId}`,
        userId 
      });
      
      // Join conversation room
      const roomId = `chat_${userId}_${recipientId}`;
      newSocket.emit('join_room', { 
        roomId,
        userId 
      });
    });

    newSocket.on('disconnect', () => {
      console.log("Agronome socket disconnected");
    });

    newSocket.on('message', (message) => {
      console.log("Agronome received message:", message);
      setMessages(prev => [...prev, message]);
        });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, recipientId]);

  // Load existing messages
  useEffect(() => {
    if (!userId || !recipientId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/?user1=${userId}&user2=${recipientId}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setMessages(data);
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [userId, recipientId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !userId || !recipientId || !socket) return;

    const messageData = {
      sender: userId,
      receiver: recipientId,
      message: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setSending(true);
    setInputText("");

    try {
      // Save to database
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
      const savedMessage = await response.json();
        
        // Add to local state
        setMessages(prev => [...prev, savedMessage]);
        
        // Send via socket
        socket.emit('send_message', {
          ...savedMessage,
          roomId: `chat_${userId}_${recipientId}`,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === userId;

    return (
      <View style={[styles.messageContainer, isUser ? styles.messageRight : styles.messageLeft]}>
        <Text style={[styles.messageText, isUser ? styles.messageTextRight : styles.messageTextLeft]}>
          {item.message}
        </Text>
        <Text style={[styles.messageTime, isUser ? styles.messageTimeRight : styles.messageTimeLeft]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#4CAF50" />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Agronome Chat</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
      >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
          keyExtractor={(item, index) => item._id || `msg-${index}`}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              style={styles.textInput}
              multiline
              maxLength={1000}
              editable={!sending}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: '#000000',
  },
  messageTextRight: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  messageTimeLeft: {
    color: '#8E8E93',
  },
  messageTimeRight: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    maxHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.5,
  },
});
