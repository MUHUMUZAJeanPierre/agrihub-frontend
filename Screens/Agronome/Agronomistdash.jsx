import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function AgronomistSimple({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [picurl, setPicurl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [countFarmer] = useState(12);
  const [darkmode] = useState(false);

  const [blogs, setBlogs] = useState([
    {
      blogTitle: "How to Protect Your Crops",
      blogurl: "https://via.placeholder.com/150",
      date: " - Jan 1, 2024",
    },
    {
      blogTitle: "Farming Tips for Dry Season",
      blogurl: "https://via.placeholder.com/150",
      date: " - Feb 12, 2024",
    },
  ]);
  const [originalblogs] = useState(blogs);
  const [loading] = useState(false);

  const pickImage = async () => {
    setIsLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPicurl(result.assets[0].uri);
    } else {
      setPicurl(null);
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  const searchFilter = (text) => {
    const searchText = text.toUpperCase();
    if (text.length > 0) {
      const filtered = originalblogs.filter((item) =>
        item.blogTitle.toUpperCase().includes(searchText)
      );
      setBlogs(filtered);
    } else {
      setBlogs(originalblogs);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: darkmode ? "#2f2f2f" : "#FBF9F9" }}>
      {/* Header Section */}
      <View style={styles.header}>
        <TextInput
          placeholder="Search..."
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            searchFilter(text);
          }}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Check if your crops are healthy</Text>

            <View>
              {picurl ? (
                <TouchableOpacity onPress={pickImage}>
                  <Image style={styles.image} source={{ uri: picurl }} />
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
                    <Text style={{ textAlign: "center" }}>Click to upload</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <TouchableOpacity style={styles.okButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cards */}
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Blogs:</Text>
          <Text style={styles.cardValue}>{blogs.length}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Farmers:</Text>
          <Text style={styles.cardValue}>{countFarmer}</Text>
        </View>
      </View>

      {/* Blog List */}
      <ScrollView style={{ paddingHorizontal: 10 }}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color="#4ba26a" />
        ) : (
          blogs.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation?.navigate("farmerblog", item)}
              style={styles.blogItem}
            >
              <View style={styles.blogImageContainer}>
                {imageLoading && (
                  <ActivityIndicator
                    style={{ position: "absolute", top: 35, alignSelf: "center" }}
                    color={darkmode ? "white" : "#4ba26a"}
                  />
                )}
                <Image
                  source={{ uri: item.blogurl }}
                  style={{ height: 75, width: "100%" }}
                  onLoad={() => setImageLoading(false)}
                />
              </View>
              <View style={styles.blogText}>
                <Text style={{ color: "#888" }}>{item.date}</Text>
                <Text style={styles.blogTitle}>{item.blogTitle}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchInput: {
    backgroundColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 15,
    flex: 1,
    height: 40,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#4ba26a",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
    lineHeight: 30,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  okButton: {
    backgroundColor: "#4ba26a",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  okButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "white",
    width: "40%",
    height: 100,
    borderRadius: 10,
    justifyContent: "center",
    padding: 10,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: "#333",
  },
  cardValue: {
    fontSize: 22,
    color: "#4ba26a",
    fontWeight: "bold",
    alignSelf: "flex-end",
  },
  blogItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
    gap: 10,
  },
  blogImageContainer: {
    width: 90,
    height: 75,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
  },
  blogText: {
    flex: 1,
    justifyContent: "center",
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
