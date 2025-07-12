import React, { useState, useRef, useEffect, useCallback } from "react";
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
  RefreshControl,
  Image,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

const SOCKET_URL = "https://agrihub-backend-4z99.onrender.com";
const API_URL = "https://agrihub-backend-4z99.onrender.com/api/chats";

const AUTH_KEYS = {
  TOKEN: "@auth_token",
  USER_ID: "@user_id",
  USER_DATA: "@user_data",
};

const MESSAGE_POLL_INTERVAL = 3000; 

const FarmerMessagesList = ({ navigation, onSelectRecipient }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
        const storedUserData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);

        if (storedUserId && storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserId(storedUserId);
          setUserRole(userData.role);
          console.log("Farmer user data loaded:", { userId: storedUserId, role: userData.role });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchPlantPathologists();
  }, [userId]);

  const fetchPlantPathologists = async () => {
    try {
      setLoading(true);
      console.log("Fetching plant pathologists for farmer...");
      
      const response = await fetch(`${SOCKET_URL}/users/role/${encodeURIComponent('plant pathologist')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Plant pathologists fetched:", data);

      const conversationsWithMessages = await Promise.all(
        data.map(async (pathologist) => {
          try {
            const messagesResponse = await fetch(`${API_URL}/?user1=${userId}&user2=${pathologist._id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const messages = messagesResponse.ok ? await messagesResponse.json() : [];
            const messageArray = Array.isArray(messages) ? messages : [];
            const lastMessage = messageArray[messageArray.length - 1];

            return {
              id: pathologist._id,
              name: pathologist.name,
              role: pathologist.role,
              avatar: pathologist.avatar || null,
              lastMessage: lastMessage?.message || "No messages yet",
              timestamp: lastMessage?.timestamp || new Date().toISOString(),
              unreadCount: 0,
              isOnline: pathologist.isOnline || false,
              expertise: pathologist.expertise || "Plant Disease Expert",
              rating: pathologist.rating || 4.5,
            };
          } catch (error) {
            console.error(`Error fetching messages for ${pathologist.name}:`, error);
            return {
              id: pathologist._id,
              name: pathologist.name,
              role: pathologist.role,
              avatar: pathologist.avatar || null,
              lastMessage: "No messages yet",
              timestamp: new Date().toISOString(),
              unreadCount: 0,
              isOnline: pathologist.isOnline || false,
              expertise: pathologist.expertise || "Plant Disease Expert",
              rating: pathologist.rating || 4.5,
            };
          }
        })
      );

      const sortedConversations = conversationsWithMessages.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setConversations(sortedConversations);
      console.log("Farmer conversations set:", sortedConversations);
    } catch (error) {
      console.error("Error fetching plant pathologists:", error);
      Alert.alert("Error", "Failed to load experts. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlantPathologists().finally(() => setRefreshing(false));
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Feather key={i} name="star" size={12} color="#FFD700" style={{ fill: '#FFD700' }} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Feather key="half" name="star" size={12} color="#FFD700" />
      );
    }

    return stars;
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => onSelectRecipient(item)}
    >
      <View style={styles.conversationContent}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>{item.name}</Text>
            <Text style={styles.conversationTime}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
          
          <View style={styles.expertiseContainer}>
            <Text style={styles.expertiseText}>{item.expertise}</Text>
            <View style={styles.ratingContainer}>
              {renderStars(item.rating)}
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>

        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading plant experts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plant Experts</Text>
        <Text style={styles.headerSubtitle}>Connect with specialists</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search experts or expertise..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conversationsList}
      />
    </View>
  );
};

export default function FarmerChat({ agroId, receiverId, recipientId, route, navigation }) {
  const [showMessagesList, setShowMessagesList] = useState(true);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessageId, setLastMessageId] = useState(null);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const routeRecipientId = route?.params?.agroId  ||  route?.params?.receiverId || route?.params?.recipientId;
  const actualRecipientId = agroId || receiverId || recipientId || routeRecipientId || selectedRecipient?.id;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
        const storedUserData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);

        if (storedUserId && storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserId(storedUserId);
          setUserRole(userData.role);
          setUserName(userData.name);
          console.log("Farmer user data loaded:", {
            userId: storedUserId,
            role: userData.role,
            name: userData.name
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (actualRecipientId) {
      setShowMessagesList(false);
    }
  }, [actualRecipientId]);

  const handleSelectRecipient = (recipient) => {
    setSelectedRecipient(recipient);
    setShowMessagesList(false);
  };

  useEffect(() => {
    if (!userId || !actualRecipientId) return;

    console.log("Farmer connecting to socket...");
    socketRef.current = io(SOCKET_URL, {
      auth: { userId, role: userRole },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log("Farmer socket connected");
      setConnectionStatus('connected');
      const roomId = getRoomId(userId, actualRecipientId, userRole, 'plant pathologist');
      socketRef.current.emit('join_room', roomId);
    });

    socketRef.current.on('disconnect', () => {
      console.log("Farmer socket disconnected");
      setConnectionStatus('disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error("Farmer socket connection error:", error);
      setConnectionStatus('disconnected');
    });

    const roomId = getRoomId(userId, actualRecipientId, userRole, 'plant pathologist');
    socketRef.current.on('room_message', (msg) => {
      console.log("Farmer received room message:", msg);
      if (msg.sender !== userId) {
        setMessages((prev) => {
          const exists = prev.some(m => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, actualRecipientId, userRole]);

  const fetchMessages = useCallback(async () => {
    if (!userId || !actualRecipientId) return;

    try {
      console.log("Farmer fetching messages for:", { userId, actualRecipientId });
      
      const response = await fetch(`${API_URL}/?user1=${userId}&user2=${actualRecipientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fetchedMessages = Array.isArray(data) ? data : [];
      
      setMessages(prevMessages => {
        if (fetchedMessages.length > prevMessages.length) {
          console.log("Farmer new messages received:", fetchedMessages);
          
          if (fetchedMessages.length > 0) {
            setLastMessageId(fetchedMessages[fetchedMessages.length - 1]._id);
          }
          
          return fetchedMessages;
        }
        
        const newMessages = fetchedMessages.filter(msg => 
          !prevMessages.some(prevMsg => prevMsg._id === msg._id)
        );
        
        if (newMessages.length > 0) {
          console.log("Farmer found new messages:", newMessages);
          return [...prevMessages, ...newMessages];
        }
        
        return prevMessages;
      });
      
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [userId, actualRecipientId]);

  useEffect(() => {
    if (!userId || !actualRecipientId) return;

    const initialLoadMessages = async () => {
      setLoading(true);
      try {
        await fetchMessages();
      } catch (error) {
        console.error("Error loading initial messages:", error);
        Alert.alert("Error", "Failed to load messages. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    };

    initialLoadMessages();
  }, [userId, actualRecipientId, fetchMessages]);

  useEffect(() => {
    if (!userId || !actualRecipientId) return;

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, MESSAGE_POLL_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userId, actualRecipientId, fetchMessages]);

  const getRoomId = (senderId, receiverId, senderRole, receiverRole) => {
    if (senderRole === 'farmer' && receiverRole === 'plant pathologist') {
      return `pathologist_farmer_${senderId}`;
    }
    if (senderRole === 'plant pathologist' && receiverRole === 'farmer') {
      return `pathologist_farmer_${receiverId}`;
    }

    const sortedIds = [senderId, receiverId].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  };

  const handleSend = useCallback(async () => {
    if (!userId || !actualRecipientId || !inputText.trim()) return;

    const messageText = inputText.trim();
    const messageData = {
      sender: userId,
      receiver: actualRecipientId,
      message: messageText,
    };

    // Create a temporary message for immediate UI feedback
    const tempMessage = {
      ...messageData,
      _id: `temp_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputText("");
    setSending(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedMessage = await response.json();
      console.log("Farmer server response:", savedMessage);

      // Check if server returned the actual message object or just a success message
      let finalMessage;
      if (savedMessage.message && savedMessage._id) {
        // Server returned the full message object
        finalMessage = { ...savedMessage, status: 'sent' };
      } else {
        // Server only returned success message, use our temp message data
        finalMessage = {
          ...tempMessage,
          _id: `msg_${Date.now()}`, // Generate a proper ID
          status: 'sent',
        };
      }

      // Replace the temporary message with the final message
      setMessages((prev) =>
        prev.map(msg =>
          msg._id === tempMessage._id ? finalMessage : msg
        )
      );

      setLastMessageId(finalMessage._id);

      // Emit via socket
      if (socketRef.current?.connected) {
        const roomId = getRoomId(userId, actualRecipientId, userRole, 'plant pathologist');
        socketRef.current.emit("send_room_message", {
          ...finalMessage,
          roomId,
        });
      }

      // Optionally re-fetch messages for accuracy
      setTimeout(fetchMessages, 500);

    } catch (error) {
      console.error("Error sending message:", error);
      // Update the temp message as failed
      setMessages((prev) =>
        prev.map(msg =>
          msg._id === tempMessage._id
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }, [userId, actualRecipientId, inputText, userRole, fetchMessages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      return "";
    }
  };

  const renderMessage = ({ item }) => {
    if (!item) return null;

    const isUser = item.sender === userId;
    const isFailed = item.status === 'failed';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageRight : styles.messageLeft,
          isFailed && styles.messageFailed,
        ]}
      >
        <Text style={[
          styles.messageText,
          isUser ? styles.messageTextRight : styles.messageTextLeft,
          isFailed && styles.messageTextFailed,
        ]}>
          {item.message}
        </Text>

        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            isUser ? styles.messageTimeRight : styles.messageTimeLeft
          ]}>
            {formatTime(item.timestamp)}
          </Text>
          {isUser && (
            <View style={styles.messageStatus}>
              {item.status === 'sending' && (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
              )}
              {item.status === 'sent' && (
                <Feather name="check" size={12} color="rgba(255,255,255,0.7)" />
              )}
              {item.status === 'failed' && (
                <Feather name="x-circle" size={12} color="#FF3B30" />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const handleRefresh = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  if (showMessagesList) {
    return <FarmerMessagesList navigation={navigation} onSelectRecipient={handleSelectRecipient} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderLeft}>
          <TouchableOpacity onPress={() => setShowMessagesList(true)}>
            <Feather name="arrow-left" size={24} color="#4CAF50" />
          </TouchableOpacity>

          <View style={styles.chatHeaderInfo}>
            <View style={styles.chatAvatarContainer}>
              {selectedRecipient?.avatar ? (
                <Image source={{ uri: selectedRecipient.avatar }} style={styles.chatAvatar} />
              ) : (
                <View style={[styles.chatAvatar, styles.defaultChatAvatar]}>
                  <Text style={styles.chatAvatarText}>
                    {selectedRecipient?.name?.charAt(0).toUpperCase() || 'E'}
                  </Text>
                </View>
              )}
              {selectedRecipient?.isOnline && <View style={styles.chatOnlineIndicator} />}
            </View>

            <View style={styles.chatHeaderText}>
              <Text style={styles.chatHeaderName}>
                {selectedRecipient?.name || 'Plant Expert'}
              </Text>
              <Text style={styles.chatHeaderStatus}>
                {selectedRecipient?.expertise || 'Plant Disease Expert'} • {connectionStatus === 'connected' ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chatHeaderActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Feather name="refresh-cw" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="phone" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item._id?.toString() || `msg-${index}`}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={handleRefresh}
                colors={['#4CAF50']}
                tintColor="#4CAF50"
              />
            }
            onContentSizeChange={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Ask about plant diseases, pests, or cultivation..."
              value={inputText}
              onChangeText={setInputText}
              style={styles.textInput}
              multiline
              maxLength={1000}
              editable={!sending}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[
                styles.sendButton,
                (!inputText.trim() || sending) && styles.sendButtonDisabled
              ]}
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
  // ... previous styles ...
  
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultChatAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatHeaderText: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 18,
    position: 'relative',
  },
  messageLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  messageFailed: {
    backgroundColor: '#FF3B30',
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
  messageTextFailed: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    marginRight: 4,
  },
  messageTimeLeft: {
    color: '#8E8E93',
  },
  messageTimeRight: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageStatus: {
    marginLeft: 4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 12,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
});
