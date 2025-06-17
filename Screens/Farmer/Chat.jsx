// import React, { useState, useEffect } from "react";
// import { TouchableOpacity, View, Image } from "react-native";
// import { Bubble, GiftedChat, InputToolbar, Send } from "react-native-gifted-chat";
// import { getItemAsync } from "expo-secure-store";
// import { Ionicons } from "@expo/vector-icons";


// export default function Chat() {
//   const [usersId, setUsersId] = useState(null);
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     getItemAsync("userId")
//       .then((data) => {
//         setUsersId(data);
//       })
//       .catch((error) => {
//         console.error("Error getting userId:", error);
//       });

//     setMessages([
//       {
//         _id: 1,
//         text: "Welcome to the chat!",
//         createdAt: new Date(),
//         user: {
//           _id: 2,
//           name: "Chat Assistant",
//         },
//       },
//     ]);
//   }, []);

//   const onSend = (newMessages = []) => {
//     const newMessage = {
//       ...newMessages[0],
//       createdAt: new Date(),
//     };

//     setMessages((previousMessages) =>
//       GiftedChat.append(previousMessages, newMessage)
//     );
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: "#fff" }}>
//       <GiftedChat
//         messages={messages}
//         onSend={(messages) => onSend(messages)}
//         user={{
//           _id: usersId || 1, // fallback for testing
//         }}
//         alwaysShowSend
//         renderSend={(props) => (
//           <View style={{ flexDirection: "row", alignItems: "center", height: 50 }}>
//             <TouchableOpacity style={{ marginRight: 5 }} onPress={() => alert("attach clicked")}>
//               <Image source={require("../../assets/attach.png")} style={{ width: 20, height: 24 }} />
//             </TouchableOpacity>

//             <TouchableOpacity style={{ marginRight: 10 }} onPress={() => alert("mic clicked")}>
//               <Image source={require("../../assets/mic.png")} style={{ width: 20, height: 20 }} />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => alert("image clicked")}>
//               <Image source={require("../../assets/image.png")} style={{ width: 24, height: 24 }} />
//             </TouchableOpacity>

//             <Send {...props} containerStyle={{ justifyContent: "center", marginLeft: 15 }}>
//               <Ionicons name="send" size={26} color="#4BA26A" style={{ width: 24, marginRight: 15 }} />
//             </Send>
//           </View>
//         )}
//         renderInputToolbar={(props) => (
//           <InputToolbar {...props} containerStyle={{ borderRadius: 10 }} />
//         )}
//         renderBubble={(props) => (
//           <Bubble
//             {...props}
//             wrapperStyle={{
//               right: {
//                 backgroundColor: "#4BA26A",
//               },
//             }}
//           />
//         )}
//       />
//     </View>
//   );
// }

