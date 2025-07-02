// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   KeyboardAvoidingView,
//   ScrollView,
//   Platform,
// } from "react-native";
// import React, { useState, useEffect } from "react";
// import { getItemAsync } from "expo-secure-store";
// import * as ImagePicker from "expo-image-picker";
// import UploadTextInput from "../../Components/uploadtextInpu";
// import { Picker } from "@react-native-picker/picker";

// const height = Dimensions.get("screen").height;

// export default function Addproduct() {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [category, setCategory] = useState("");
//   const [region, setRegion] = useState("");
//   const [farmerName, setFarmerName] = useState("");
//   const [minOrder, setMinOrder] = useState("");
//   const [isFlashDeal, setIsFlashDeal] = useState(false);
//   const [discount, setDiscount] = useState("");
//   const [picurl, setPicurl] = useState(null);
//   const [addedId, setAddedId] = useState();
//   const [isLoading, setIsLoading] = useState(false);
//   const [status, setStatus] = useState("");
//   const [amount, setAmount] = useState(0);

//   const categories = [
//     { label: "Select Category", value: "" },
//     { label: "Kamere (Organic)", value: "organic" },
//     { label: "Imboga (Vegetables)", value: "vegetables" },
//     { label: "Imbuto (Fruits)", value: "fruits" },
//     { label: "Imbuto (Seeds)", value: "seeds" },
//     { label: "Amata (Dairy)", value: "dairy" },
//     { label: "Ingano (Grains)", value: "grains" },
//     { label: "Inyama (Meat)", value: "meat" },
//     { label: "Ibinyobwa (Beverages)", value: "beverages" },
//   ];

//   const regions = [
//     { label: "Select Region", value: "" },
//     { label: "Kigali", value: "Kigali" },
//     { label: "Eastern Province", value: "Eastern" },
//     { label: "Western Province", value: "Western" },
//     { label: "Northern Province", value: "Northern" },
//     { label: "Southern Province", value: "Southern" },
//   ];

//   useEffect(() => {
//     getItemAsync("userId")
//       .then((data) => setAddedId(data))
//       .catch((err) => console.log(err));
//   }, []);

//   const pickImage = async (setLoadingState, setImageUrl) => {
//     try {
//       setLoadingState(true);
//       const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!permissionResult.granted) {
//         Alert.alert("Permission Required", "Permission to access camera roll is required!");
//         return;
//       }
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//       });

//       if (!result.canceled) {
//         setImageUrl(result.assets[0].uri);
//       }
//     } catch (error) {
//       console.log("Image picker error:", error);
//       Alert.alert("Error", "Failed to pick image");
//     } finally {
//       setLoadingState(false);
//     }
//   };

//   const AddProduct = async (productData) => {
//     try {
//       const formattedPrice = `RWF ${parseInt(productData.price).toLocaleString()}`;
//       const product = {
//         title: productData.title,
//         description: productData.description,
//         price: formattedPrice,
//         basePrice: formattedPrice,
//         category: productData.category,
//         region: productData.region,
//         farmer: productData.farmerName,
//         minOrder: productData.minOrder,
//         img: productData.picurl,
//         isFlashDeal: productData.isFlashDeal,
//         discount: productData.isFlashDeal ? productData.discount : null,
//         addedBy: productData.addedId,
//         status: productData.status,
//         amount: productData.amount,
//         createdAt: new Date().toISOString(),
//       };

//       console.log("Submitting product:", product);

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       console.log("Product added successfully");
//       return product;
//     } catch (error) {
//       console.error("Add product failed:", error);
//       throw error;
//     }
//   };

//   const handleAddProducts = async () => {
//     if (
//       !title ||
//       !description ||
//       !price ||
//       !category ||
//       !region ||
//       !farmerName ||
//       !minOrder ||
//       !picurl ||
//       !status ||
//       !amount
//     ) {
//       Alert.alert("Error", "Please fill all required fields");
//       return;
//     }

//     if (isNaN(parseInt(price)) || isNaN(parseInt(amount))) {
//       Alert.alert("Error", "Price and amount must be numeric");
//       return;
//     }

//     if (isFlashDeal && !discount) {
//       Alert.alert("Error", "Enter discount for flash deal");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const productData = {
//         title,
//         description,
//         price,
//         category,
//         region,
//         farmerName,
//         minOrder,
//         picurl,
//         isFlashDeal,
//         discount,
//         addedId,
//         status,
//         amount,
//       };

//       await AddProduct(productData);
//       Alert.alert("Success", "Product added");

//       // Reset
//       setTitle("");
//       setDescription("");
//       setPrice("");
//       setCategory("");
//       setRegion("");
//       setFarmerName("");
//       setMinOrder("");
//       setDiscount("");
//       setIsFlashDeal(false);
//       setPicurl(null);
//       setStatus("");
//       setAmount(0);
//     } catch (error) {
//       Alert.alert("Error", "Product submission failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
//       <ScrollView>
//         <View style={styles.container}>
//           <Text style={styles.title}>ADD A NEW PRODUCT</Text>

//           <View style={styles.imageSection}>
//             {picurl ? (
//               <TouchableOpacity onPress={() => pickImage(setIsLoading, setPicurl)}>
//                 <Image style={styles.image} source={{ uri: picurl }} />
//               </TouchableOpacity>
//             ) : isLoading ? (
//               <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#4ba26a" />
//                 <Text style={styles.uploadText}>Loading...</Text>
//               </View>
//             ) : (
//               <View style={styles.uploadContainer}>
//                 <Image style={styles.image} source={require("../../assets/upload.png")} />
//                 <TouchableOpacity onPress={() => pickImage(setIsLoading, setPicurl)}>
//                   <Text style={styles.uploadText}>Click to upload</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>

//           <View style={styles.formSection}>
//             <UploadTextInput placeholder="Enter product title" value={title} onChangeText={setTitle} />
//             <UploadTextInput placeholder="Enter description" value={description} onChangeText={setDescription} />
//             <UploadTextInput placeholder="Enter product price" keyboardType="numeric" value={price} onChangeText={setPrice} />
//             <UploadTextInput placeholder="Enter product status" value={status} onChangeText={setStatus} />
//             <UploadTextInput placeholder="Enter product amount" keyboardType="numeric" value={amount.toString()} onChangeText={(text) => setAmount(Number(text))} />
//             <UploadTextInput placeholder="Enter region" value={region} onChangeText={setRegion} />
//             <UploadTextInput placeholder="Enter category" value={category} onChangeText={setCategory} />
//             <UploadTextInput placeholder="Enter farmer name" value={farmerName} onChangeText={setFarmerName} />
//             <UploadTextInput placeholder="Minimum order quantity" keyboardType="numeric" value={minOrder} onChangeText={setMinOrder} />

//             {isFlashDeal && (
//               <UploadTextInput placeholder="Enter discount (%)" keyboardType="numeric" value={discount} onChangeText={setDiscount} />
//             )}

//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[styles.addButton, isLoading && styles.addButtonDisabled]}
//                 onPress={handleAddProducts}
//                 disabled={isLoading}
//               >
//                 <Text style={styles.addButtonText}>{isLoading ? "ADDING..." : "ADD PRODUCT"}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     minHeight: height,
//     backgroundColor: "white",
//     padding: 20,
//   },
//   title: {
//     color: "#4ba26a",
//     fontWeight: "bold",
//     fontSize: 18,
//     paddingBottom: 20,
//     textAlign: "center",
//   },
//   imageSection: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   uploadContainer: {
//     alignItems: "center",
//   },
//   loadingContainer: {
//     alignItems: "center",
//     padding: 20,
//   },
//   image: {
//     width: 100,
//     height: 100,
//     marginBottom: 10,
//     borderRadius: 10,
//   },
//   uploadText: {
//     fontSize: 14,
//     color: "#212121",
//   },
//   formSection: {
//     paddingTop: 10,
//   },
//   buttonContainer: {
//     marginTop: 30,
//   },
//   addButton: {
//     backgroundColor: "#4ba26a",
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     elevation: 3,
//   },
//   addButtonDisabled: {
//     backgroundColor: "#A9A9A9",
//     opacity: 0.6,
//   },
//   addButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });


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
  StatusBar,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getItemAsync } from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../contexts/ThemeContext";
import UploadTextInput from "../../Components/uploadtextInpu";
import { Picker } from "@react-native-picker/picker";

const height = Dimensions.get("screen").height;

export default function Addproduct() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      Alert.alert("Success", "Product added successfully!");

      // Reset form
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

  const styles = createStyles(isDark);

  return (
    <View style={styles.wrapper}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? "#121212" : "#ffffff"} 
      />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add New Product</Text>
              <Text style={styles.subtitle}>Create a new product listing</Text>
            </View>

            {/* Image Upload Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Image</Text>
              <View style={styles.imageSection}>
                {picurl ? (
                  <TouchableOpacity 
                    onPress={() => pickImage(setIsLoading, setPicurl)}
                    style={styles.imageContainer}
                    activeOpacity={0.8}
                  >
                    <Image style={styles.selectedImage} source={{ uri: picurl }} />
                    <View style={styles.imageOverlay}>
                      <Text style={styles.changeImageText}>Tap to change</Text>
                    </View>
                  </TouchableOpacity>
                ) : isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4ba26a" />
                    <Text style={styles.loadingText}>Uploading...</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.uploadContainer}
                    onPress={() => pickImage(setIsLoading, setPicurl)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.uploadIcon}>
                      <Text style={styles.uploadIconText}>📸</Text>
                    </View>
                    <Text style={styles.uploadText}>Tap to upload image</Text>
                    <Text style={styles.uploadSubtext}>JPG, PNG up to 10MB</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Product Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <View style={styles.formGrid}>
                <UploadTextInput 
                  placeholder="Product title" 
                  value={title} 
                  onChangeText={setTitle}
                  style={[styles.input, isDark && styles.inputDark]}
                />
                <UploadTextInput 
                  placeholder="Product description" 
                  value={description} 
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                />
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <UploadTextInput 
                      placeholder="Price (RWF)" 
                      keyboardType="numeric" 
                      value={price} 
                      onChangeText={setPrice}
                      style={[styles.input, isDark && styles.inputDark]}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <UploadTextInput 
                      placeholder="Quantity available" 
                      keyboardType="numeric" 
                      value={amount.toString()} 
                      onChangeText={(text) => setAmount(Number(text))}
                      style={[styles.input, isDark && styles.inputDark]}
                    />
                  </View>
                </View>

                {/* Picker Sections */}
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Category</Text>
                  <View style={[styles.pickerWrapper, isDark && styles.pickerWrapperDark]}>
                    <Picker
                      selectedValue={category}
                      onValueChange={setCategory}
                      style={[styles.picker, isDark && styles.pickerDark]}
                    >
                      {categories.map((cat) => (
                        <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Region</Text>
                  <View style={[styles.pickerWrapper, isDark && styles.pickerWrapperDark]}>
                    <Picker
                      selectedValue={region}
                      onValueChange={setRegion}
                      style={[styles.picker, isDark && styles.pickerDark]}
                    >
                      {regions.map((reg) => (
                        <Picker.Item key={reg.value} label={reg.label} value={reg.value} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <UploadTextInput 
                  placeholder="Farmer/Supplier name" 
                  value={farmerName} 
                  onChangeText={setFarmerName}
                  style={[styles.input, isDark && styles.inputDark]}
                />
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <UploadTextInput 
                      placeholder="Min. order qty" 
                      keyboardType="numeric" 
                      value={minOrder} 
                      onChangeText={setMinOrder}
                      style={[styles.input, isDark && styles.inputDark]}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <UploadTextInput 
                      placeholder="Product status" 
                      value={status} 
                      onChangeText={setStatus}
                      style={[styles.input, isDark && styles.inputDark]}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Flash Deal Section */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.flashDealToggle}
                onPress={() => setIsFlashDeal(!isFlashDeal)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isFlashDeal && styles.checkboxActive]}>
                  {isFlashDeal && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.flashDealText}>Enable Flash Deal</Text>
              </TouchableOpacity>
              
              {isFlashDeal && (
                <View style={styles.discountContainer}>
                  <UploadTextInput 
                    placeholder="Discount percentage (%)" 
                    keyboardType="numeric" 
                    value={discount} 
                    onChangeText={setDiscount}
                    style={[styles.input, isDark && styles.inputDark]}
                  />
                </View>
              )}
            </View>

            {/* Submit Button */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleAddProducts}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingButton}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.submitButtonText}>Adding Product...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Add Product</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (isDark) => StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: isDark ? "#121212" : "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: isDark ? "#ffffff" : "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? "#a0a0a0" : "#7f8c8d",
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: isDark ? "#ffffff" : "#2c3e50",
    marginBottom: 15,
  },
  imageSection: {
    alignItems: "center",
  },
  uploadContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: isDark ? "#333333" : "#e1e8ed",
    borderStyle: "dashed",
    backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: isDark ? "#333333" : "#f1f3f4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadIconText: {
    fontSize: 24,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: isDark ? "#ffffff" : "#4ba26a",
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: isDark ? "#a0a0a0" : "#7f8c8d",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 8,
    alignItems: "center",
  },
  changeImageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  loadingContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? "#333333" : "#e1e8ed",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: isDark ? "#a0a0a0" : "#7f8c8d",
  },
  formGrid: {
    gap: 16,
  },
  input: {
    backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
    borderWidth: 1,
    borderColor: isDark ? "#333333" : "#e1e8ed",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: isDark ? "#ffffff" : "#2c3e50",
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333333",
    color: "#ffffff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    marginVertical: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: isDark ? "#ffffff" : "#2c3e50",
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
    borderWidth: 1,
    borderColor: isDark ? "#333333" : "#e1e8ed",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerWrapperDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333333",
  },
  picker: {
    height: 50,
    color: isDark ? "#ffffff" : "#2c3e50",
  },
  pickerDark: {
    color: "#ffffff",
  },
  flashDealToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: isDark ? "#666666" : "#d1d5db",
    backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#4ba26a",
    borderColor: "#4ba26a",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  flashDealText: {
    fontSize: 16,
    fontWeight: "500",
    color: isDark ? "#ffffff" : "#2c3e50",
  },
  discountContainer: {
    marginTop: 12,
  },
  buttonSection: {
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#4ba26a",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4ba26a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#a0a0a0",
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});