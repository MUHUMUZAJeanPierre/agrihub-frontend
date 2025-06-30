// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   StatusBar,
//   Animated,
//   Dimensions,
// } from "react-native";
// import Feather from "react-native-vector-icons/Feather";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import Ionicons from "react-native-vector-icons/Ionicons";

// const { width } = Dimensions.get('window');

// export default function Chat() {
//   const [messages, setMessages] = useState([
//     {
//       id: "1",
//       text: "Hello! I'm here to help you with any agricultural questions or concerns. How can I assist you today?",
//       createdAt: new Date(Date.now() - 300000),
//       senderId: "agronomist",
//       receiverId: "user1",
//       type: "text",
//       status: "delivered"
//     }
//   ]);
//   const [inputText, setInputText] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [onlineStatus, setOnlineStatus] = useState(true);
  
//   const userId = "user1";      
//   const agroId = "agronomist";
//   const flatListRef = useRef(null);
//   const inputRef = useRef(null);
//   const typingAnimation = useRef(new Animated.Value(0)).current;

//   // Simulate agronomist typing
//   const simulateTyping = () => {
//     setIsTyping(true);
    
//     // Animate typing indicator
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(typingAnimation, {
//           toValue: 1,
//           duration: 600,
//           useNativeDriver: true,
//         }),
//         Animated.timing(typingAnimation, {
//           toValue: 0,
//           duration: 600,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     setTimeout(() => {
//       setIsTyping(false);
//       typingAnimation.stopAnimation();
      
//       const responses = [
//         "That's a great question! Let me help you with that crop issue.",
//         "Based on your description, I recommend checking the soil pH levels first.",
//         "Have you considered using organic pest control methods for this problem?",
//         "The weather conditions you mentioned could definitely affect plant growth.",
//         "I'd suggest taking a soil sample for testing to get accurate results."
//       ];
      
//       const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
//       const responseMessage = {
//         id: Date.now().toString(),
//         text: randomResponse,
//         createdAt: new Date(),
//         senderId: agroId,
//         receiverId: userId,
//         type: "text",
//         status: "delivered"
//       };
      
//       setMessages(prev => [responseMessage, ...prev]);
//     }, 2500);
//   };

//   const handleSend = () => {
//     if (inputText.trim() === "") return;

//     const newMessage = {
//       id: Date.now().toString(),
//       text: inputText,
//       createdAt: new Date(),
//       senderId: userId,
//       receiverId: agroId,
//       type: "text",
//       status: "sent"
//     };

//     setMessages((prev) => [newMessage, ...prev]);
//     setInputText("");
    
//     // Simulate agronomist response
//     setTimeout(() => {
//       simulateTyping();
//     }, 1000);
//   };

//   const formatTime = (date) => {
//     const now = new Date();
//     const messageDate = new Date(date);
//     const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
//     if (diffInMinutes < 1) return "Just now";
//     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//     if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
//     return messageDate.toLocaleDateString();
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'sent':
//         return <Feather name="check" size={12} color="#9CA3AF" />;
//       case 'delivered':
//         return <Feather name="check-circle" size={12} color="#10B981" />;
//       case 'read':
//         return <Feather name="check-circle" size={12} color="#3B82F6" />;
//       default:
//         return null;
//     }
//   };

//   const TypingIndicator = () => (
//     <View style={styles.typingContainer}>
//       <View style={styles.typingBubble}>
//         <Text style={styles.typingText}>Dr. Smith is typing</Text>
//         <Animated.View
//           style={[
//             styles.typingDots,
//             {
//               opacity: typingAnimation,
//             },
//           ]}
//         >
//           <View style={styles.dot} />
//           <View style={styles.dot} />
//           <View style={styles.dot} />
//         </Animated.View>
//       </View>
//     </View>
//   );

//   const QuickReply = ({ text, onPress }) => (
//     <TouchableOpacity style={styles.quickReplyButton} onPress={onPress}>
//       <Text style={styles.quickReplyText}>{text}</Text>
//     </TouchableOpacity>
//   );

//   const quickReplies = [
//     "What's this pest?",
//     "Soil health tips",
//     "Weather concerns",
//     "Crop rotation advice"
//   ];

//   const renderItem = ({ item, index }) => {
//     const isUser = item.senderId === userId;
//     const isLastMessage = index === 0;

//     return (
//       <View style={styles.messageWrapper}>
//         <View
//           style={[
//             styles.messageContainer,
//             isUser ? styles.messageRight : styles.messageLeft,
//           ]}
//         >
//           <Text style={[
//             styles.messageText,
//             isUser ? styles.userMessageText : styles.agroMessageText
//           ]}>
//             {item.text}
//           </Text>
          
//           <View style={styles.messageFooter}>
//             <Text style={[
//               styles.messageTime,
//               isUser ? styles.userMessageTime : styles.agroMessageTime
//             ]}>
//               {formatTime(item.createdAt)}
//             </Text>
            
//             {isUser && (
//               <View style={styles.messageStatus}>
//                 {getStatusIcon(item.status)}
//               </View>
//             )}
//           </View>
//         </View>
        
//         {!isUser && isLastMessage && (
//           <View style={styles.avatarContainer}>
//             <View style={styles.avatar}>
//               <MaterialIcons name="agriculture" size={20} color="#10B981" />
//             </View>
//             <View style={styles.onlineIndicator} />
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <TouchableOpacity style={styles.backButton}>
//         <Feather name="arrow-left" size={24} color="#1F2937" />
//       </TouchableOpacity>
      
//       <View style={styles.headerCenter}>
//         <View style={styles.headerAvatar}>
//           <MaterialIcons name="agriculture" size={24} color="#10B981" />
//           <View style={styles.headerOnlineIndicator} />
//         </View>
        
//         <View style={styles.headerInfo}>
//           <Text style={styles.headerName}>Dr. Smith</Text>
//           <Text style={styles.headerStatus}>
//             {onlineStatus ? "Online • Agricultural Expert" : "Last seen 5m ago"}
//           </Text>
//         </View>
//       </View>
      
//       <View style={styles.headerActions}>
//         <TouchableOpacity style={styles.headerActionButton}>
//           <Feather name="phone" size={20} color="#6B7280" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.headerActionButton}>
//           <Feather name="video" size={20} color="#6B7280" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
//       {renderHeader()}
      
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.chatContainer}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//       >
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.id}
//           inverted
//           contentContainerStyle={styles.messagesList}
//           showsVerticalScrollIndicator={false}
//           ListHeaderComponent={() => isTyping ? <TypingIndicator /> : null}
//         />

//         {messages.length === 1 && (
//           <View style={styles.quickRepliesContainer}>
//             <Text style={styles.quickRepliesTitle}>Quick questions:</Text>
//             <View style={styles.quickRepliesGrid}>
//               {quickReplies.map((reply, index) => (
//                 <QuickReply
//                   key={index}
//                   text={reply}
//                   onPress={() => {
//                     setInputText(reply);
//                     inputRef.current?.focus();
//                   }}
//                 />
//               ))}
//             </View>
//           </View>
//         )}

//         <View style={styles.inputContainer}>
//           <TouchableOpacity style={styles.attachButton}>
//             <Feather name="paperclip" size={20} color="#6B7280" />
//           </TouchableOpacity>
          
//           <View style={styles.inputWrapper}>
//             <TextInput
//               ref={inputRef}
//               placeholder="Ask about crops, pests, soil..."
//               value={inputText}
//               onChangeText={setInputText}
//               style={styles.textInput}
//               multiline
//               maxLength={500}
//               placeholderTextColor="#9CA3AF"
//             />
            
//             <TouchableOpacity style={styles.emojiButton}>
//               <Feather name="smile" size={20} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
          
//           <TouchableOpacity 
//             onPress={handleSend} 
//             style={[
//               styles.sendButton,
//               inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
//             ]}
//             disabled={!inputText.trim()}
//           >
//             <Feather 
//               name="send" 
//               size={18} 
//               color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"} 
//             />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },
//   header: {
//     backgroundColor: "#FFFFFF",
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 15,
//     paddingHorizontal: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   backButton: {
//     padding: 8,
//     marginRight: 12,
//   },
//   headerCenter: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   headerAvatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     backgroundColor: "#E8FDF5",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//     position: "relative",
//   },
//   headerOnlineIndicator: {
//     position: "absolute",
//     bottom: 2,
//     right: 2,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#10B981",
//     borderWidth: 2,
//     borderColor: "#FFFFFF",
//   },
//   headerInfo: {
//     flex: 1,
//   },
//   headerName: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#1F2937",
//     marginBottom: 2,
//   },
//   headerStatus: {
//     fontSize: 13,
//     color: "#6B7280",
//   },
//   headerActions: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   headerActionButton: {
//     padding: 8,
//   },
//   chatContainer: {
//     flex: 1,
//   },
//   messagesList: {
//     paddingHorizontal: 16,
//     paddingTop: 20,
//   },
//   messageWrapper: {
//     marginBottom: 16,
//     flexDirection: "row",
//     alignItems: "flex-end",
//   },
//   messageContainer: {
//     maxWidth: "75%",
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   messageRight: {
//     alignSelf: "flex-end",
//     backgroundColor: "#10B981",
//     borderBottomRightRadius: 8,
//     marginLeft: "auto",
//   },
//   messageLeft: {
//     alignSelf: "flex-start",
//     backgroundColor: "#FFFFFF",
//     borderBottomLeftRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   messageText: {
//     fontSize: 16,
//     lineHeight: 22,
//     marginBottom: 6,
//   },
//   userMessageText: {
//     color: "#FFFFFF",
//   },
//   agroMessageText: {
//     color: "#1F2937",
//   },
//   messageFooter: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   messageTime: {
//     fontSize: 11,
//     marginTop: 2,
//   },
//   userMessageTime: {
//     color: "rgba(255, 255, 255, 0.7)",
//   },
//   agroMessageTime: {
//     color: "#9CA3AF",
//   },
//   messageStatus: {
//     marginLeft: 6,
//   },
//   avatarContainer: {
//     marginLeft: 8,
//     position: "relative",
//   },
//   avatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "#E8FDF5",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   onlineIndicator: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#10B981",
//     borderWidth: 2,
//     borderColor: "#F8FAFC",
//   },
//   typingContainer: {
//     marginBottom: 16,
//     alignItems: "flex-start",
//   },
//   typingBubble: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     borderBottomLeftRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   typingText: {
//     fontSize: 14,
//     color: "#6B7280",
//     fontStyle: "italic",
//     marginRight: 8,
//   },
//   typingDots: {
//     flexDirection: "row",
//     gap: 2,
//   },
//   dot: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#10B981",
//   },
//   quickRepliesContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     backgroundColor: "#FFFFFF",
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//   },
//   quickRepliesTitle: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#6B7280",
//     marginBottom: 12,
//   },
//   quickRepliesGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//   },
//   quickReplyButton: {
//     backgroundColor: "#F3F4F6",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   quickReplyText: {
//     fontSize: 14,
//     color: "#4B5563",
//     fontWeight: "500",
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#FFFFFF",
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//     gap: 12,
//   },
//   attachButton: {
//     padding: 8,
//     alignSelf: "flex-end",
//     marginBottom: 6,
//   },
//   inputWrapper: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "flex-end",
//     backgroundColor: "#F9FAFB",
//     borderRadius: 24,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     maxHeight: 100,
//   },
//   textInput: {
//     flex: 1,
//     fontSize: 16,
//     color: "#1F2937",
//     paddingVertical: 8,
//     maxHeight: 80,
//   },
//   emojiButton: {
//     padding: 4,
//     marginLeft: 8,
//   },
//   sendButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sendButtonActive: {
//     backgroundColor: "#10B981",
//   },
//   sendButtonInactive: {
//     backgroundColor: "#F3F4F6",
//   },
// });



// Chat.js
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
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { io } from "socket.io-client";

// Setup your server URL
const SOCKET_URL = "https://agrihub-backend-4z99.onrender.com"; // Replace with your deployed backend if needed
const API_URL = "https://agrihub-backend-4z99.onrender.com/api";

export default function Chat({ userId, agroId }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);
  const socketRef = useRef(null);

  // 1. Connect to socket and listen for incoming messages
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on(`receive_message_${userId}`, (msg) => {
      setMessages((prev) => [msg, ...prev]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  // 2. Load chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/messages`, {
          params: { user1: userId, user2: agroId },
        });
        setMessages(res.data.reverse()); // newer messages at bottom
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    fetchMessages();
  }, [userId, agroId]);

  // 3. Handle send
  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const messageData = {
      sender: userId,
      receiver: agroId,
      message: inputText.trim(),
    };

    try {
      const res = await axios.post(`${API_URL}/messages`, messageData);
      const savedMessage = res.data;

      setMessages((prev) => [savedMessage, ...prev]);
      socketRef.current.emit("send_message", savedMessage);
      setInputText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // 4. Format timestamp
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 5. Render message
  const renderItem = ({ item }) => {
    const isUser = item.sender === userId;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          inverted
          contentContainerStyle={styles.messagesList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Feather name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ✅ Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
  },
  messageRight: {
    backgroundColor: "#10B981",
    alignSelf: "flex-end",
  },
  messageLeft: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#111827",
  },
  messageTime: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
});
