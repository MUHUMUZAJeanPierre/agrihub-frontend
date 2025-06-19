import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function SimpleChat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const userId = "user1";       // Simulated logged-in user
  const agroId = "agronomist";  // Simulated recipient

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      createdAt: new Date(),
      senderId: userId,
      receiverId: agroId,
    };

    setMessages((prev) => [newMessage, ...prev]);
    setInputText("");
  };

  const renderItem = ({ item }) => {
    const isUser = item.senderId === userId;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {item.createdAt.toLocaleTimeString().slice(0, 5)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#FBF9F9" }}
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.textInput}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  messageRight: {
    alignSelf: "flex-end",
    backgroundColor: "#4BA26A",
  },
  messageLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#E4E4E4",
  },
  messageText: {
    color: "white",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 2,
    color: "lightgray",
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 15,
  },
  sendButton: {
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: "#4BA26A",
    fontWeight: "bold",
  },
});
