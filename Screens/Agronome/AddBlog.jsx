import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-paper";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import UploadTextInput from "../../Components/uploadtextInpu";
import Button from "../../Components/Button";

const height = Dimensions.get("screen").height;

export default function AddBlog() {
  const [blogurl, setBlogurl] = useState(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescri, setBlogDescri] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    setIsLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setBlogurl(result.assets[0].uri);
    }
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleAddBlogs = () => {
    if (blogTitle === "" || blogDescri === "" || blogurl === null) {
      Alert.alert("Fill all blog details");
    } else {
      console.log("Blog Added:", { blogTitle, blogDescri, blogurl });
      Alert.alert("Blog added");
      setBlogTitle("");
      setBlogDescri("");
      setBlogurl(null);
    }
  };

  return (
    <KeyboardAvoidingView>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.headerText}>ADD A NEW BLOG</Text>

          <View>
            {blogurl ? (
              <TouchableOpacity onPress={pickImage}>
                <Image style={styles.image} source={{ uri: blogurl }} />
              </TouchableOpacity>
            ) : isLoading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Image
                  style={styles.image}
                  source={require("../../assets/upload.png")}
                />
                <TouchableOpacity onPress={pickImage}>
                  <Text style={styles.uploadText}>Click to upload</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={{ paddingTop: 20 }}>
            <UploadTextInput
              placeholder="Enter blog title"
              value={blogTitle}
              onChangeText={setBlogTitle}
            />

            <TextInput
              placeholder="Enter blog description..."
              value={blogDescri}
              onChangeText={setBlogDescri}
              multiline
              placeholderTextColor="darkgrey"
              style={styles.textInput}
              underlineColor="transparent"
              theme={{
                colors: {
                  primary: "rgba(0,0,0,0.2)",
                },
                roundness: 10,
              }}
            />

            <View style={{ marginTop: 30 }}>
              <Button title="ADD" onPress={handleAddBlogs} />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height,
    backgroundColor: "white",
    padding: 20,
    justifyContent: "center",
  },
  headerText: {
    color: "#4ba26a",
    fontWeight: "bold",
    fontSize: 16,
    paddingBottom: 40,
    textAlign: "center",
    fontFamily: "Poppins_700Bold",
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
  },
  uploadText: {
    color: "#212121",
    textAlign: "center",
  },
  textInput: {
    height: 150,
    fontSize: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A9A9A9",
    backgroundColor: "white",
  },
});
