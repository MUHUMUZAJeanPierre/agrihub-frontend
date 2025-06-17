import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getItemAsync } from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import UploadTextInput from "../../Components/uploadtextInpu";
import { Picker } from "@react-native-picker/picker";

const height = Dimensions.get("screen").height;

export default function Addproduct() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [discount, setDiscount] = useState("");
  const [picurl, setPicurl] = useState(null);
  const [addedId, setAddedId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState(0);

  const categories = [
    { label: "Select Category", value: "" },
    { label: "Kamere (Organic)", value: "organic" },
    { label: "Imboga (Vegetables)", value: "vegetables" },
    { label: "Imbuto (Fruits)", value: "fruits" },
    { label: "Imbuto (Seeds)", value: "seeds" },
    { label: "Amata (Dairy)", value: "dairy" },
    { label: "Ingano (Grains)", value: "grains" },
    { label: "Inyama (Meat)", value: "meat" },
    { label: "Ibinyobwa (Beverages)", value: "beverages" },
  ];

  const regions = [
    { label: "Select Region", value: "" },
    { label: "Kigali", value: "Kigali" },
    { label: "Eastern Province", value: "Eastern" },
    { label: "Western Province", value: "Western" },
    { label: "Northern Province", value: "Northern" },
    { label: "Southern Province", value: "Southern" },
  ];

  useEffect(() => {
    getItemAsync("userId")
      .then((data) => setAddedId(data))
      .catch((err) => console.log(err));
  }, []);

  const pickImage = async (setLoadingState, setImageUrl) => {
    try {
      setLoadingState(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setLoadingState(false);
    }
  };

  const AddProduct = async (productData) => {
    try {
      const formattedPrice = `RWF ${parseInt(productData.price).toLocaleString()}`;
      const product = {
        title: productData.title,
        description: productData.description,
        price: formattedPrice,
        basePrice: formattedPrice,
        category: productData.category,
        region: productData.region,
        farmer: productData.farmerName,
        minOrder: productData.minOrder,
        img: productData.picurl,
        isFlashDeal: productData.isFlashDeal,
        discount: productData.isFlashDeal ? productData.discount : null,
        addedBy: productData.addedId,
        status: productData.status,
        amount: productData.amount,
        createdAt: new Date().toISOString(),
      };

      console.log("Submitting product:", product);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Product added successfully");
      return product;
    } catch (error) {
      console.error("Add product failed:", error);
      throw error;
    }
  };

  const handleAddProducts = async () => {
    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !region ||
      !farmerName ||
      !minOrder ||
      !picurl ||
      !status ||
      !amount
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (isNaN(parseInt(price)) || isNaN(parseInt(amount))) {
      Alert.alert("Error", "Price and amount must be numeric");
      return;
    }

    if (isFlashDeal && !discount) {
      Alert.alert("Error", "Enter discount for flash deal");
      return;
    }

    try {
      setIsLoading(true);
      const productData = {
        title,
        description,
        price,
        category,
        region,
        farmerName,
        minOrder,
        picurl,
        isFlashDeal,
        discount,
        addedId,
        status,
        amount,
      };

      await AddProduct(productData);
      Alert.alert("Success", "Product added");

      // Reset
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setRegion("");
      setFarmerName("");
      setMinOrder("");
      setDiscount("");
      setIsFlashDeal(false);
      setPicurl(null);
      setStatus("");
      setAmount(0);
    } catch (error) {
      Alert.alert("Error", "Product submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>ADD A NEW PRODUCT</Text>

          <View style={styles.imageSection}>
            {picurl ? (
              <TouchableOpacity onPress={() => pickImage(setIsLoading, setPicurl)}>
                <Image style={styles.image} source={{ uri: picurl }} />
              </TouchableOpacity>
            ) : isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4ba26a" />
                <Text style={styles.uploadText}>Loading...</Text>
              </View>
            ) : (
              <View style={styles.uploadContainer}>
                <Image style={styles.image} source={require("../../assets/upload.png")} />
                <TouchableOpacity onPress={() => pickImage(setIsLoading, setPicurl)}>
                  <Text style={styles.uploadText}>Click to upload</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            <UploadTextInput placeholder="Enter product title" value={title} onChangeText={setTitle} />
            <UploadTextInput placeholder="Enter description" value={description} onChangeText={setDescription} />
            <UploadTextInput placeholder="Enter product price" keyboardType="numeric" value={price} onChangeText={setPrice} />
            <UploadTextInput placeholder="Enter product status" value={status} onChangeText={setStatus} />
            <UploadTextInput placeholder="Enter product amount" keyboardType="numeric" value={amount.toString()} onChangeText={(text) => setAmount(Number(text))} />
            <UploadTextInput placeholder="Enter region" value={region} onChangeText={setRegion} />
            <UploadTextInput placeholder="Enter category" value={category} onChangeText={setCategory} />
            <UploadTextInput placeholder="Enter farmer name" value={farmerName} onChangeText={setFarmerName} />
            <UploadTextInput placeholder="Minimum order quantity" keyboardType="numeric" value={minOrder} onChangeText={setMinOrder} />

            {isFlashDeal && (
              <UploadTextInput placeholder="Enter discount (%)" keyboardType="numeric" value={discount} onChangeText={setDiscount} />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.addButton, isLoading && styles.addButtonDisabled]}
                onPress={handleAddProducts}
                disabled={isLoading}
              >
                <Text style={styles.addButtonText}>{isLoading ? "ADDING..." : "ADD PRODUCT"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: height,
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    color: "#4ba26a",
    fontWeight: "bold",
    fontSize: 18,
    paddingBottom: 20,
    textAlign: "center",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  uploadContainer: {
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
  },
  uploadText: {
    fontSize: 14,
    color: "#212121",
  },
  formSection: {
    paddingTop: 10,
  },
  buttonContainer: {
    marginTop: 30,
  },
  addButton: {
    backgroundColor: "#4ba26a",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: "#A9A9A9",
    opacity: 0.6,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
