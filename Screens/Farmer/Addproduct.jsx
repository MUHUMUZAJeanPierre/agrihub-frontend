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
  Animated,
} from "react-native";
import axios from 'axios';
import React, { useState, useEffect, useRef, useMemo } from "react";
import { getItemAsync } from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../contexts/ThemeContext";
import UploadTextInput from "../../Components/uploadtextInpu";
import { Picker } from "@react-native-picker/picker";
import Button from "../../Components/Button";

const { width, height } = Dimensions.get("window");


const THEME_COLORS = {
  light: {
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',
    text: '#1A202C',
    textSecondary: '#718096',
    textMuted: '#A0AEC0',
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    shadow: '#000000',
    placeholder: '#9CA3AF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E5E7EB',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
  },
  dark: {
    background: '#000000',
    cardBackground: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    primary: '#10B981',
    primaryLight: '#064E3B',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    shadow: '#000000',
    placeholder: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#374151',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
  },
};

export default function AddProduct({ navigation }) {
  const { theme } = useTheme();
  const Colors = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.light, [theme]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // State management
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    price: "",
    pastPrice: "",
    category: "",
    region: "",
    picurl: null,
  });
  
  const [addedId, setAddedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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

  // Animation effects
  useEffect(() => {
    const initAnimations = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    initAnimations.start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    getItemAsync("userId")
      .then((data) => {
        if (data) {
          setAddedId(data);
        }
      })
      .catch((err) => console.log("Error getting userId:", err));
  }, []);

  // Fixed image picker with updated API
  const pickImage = async () => {
    try {
      setIsLoading(true);
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3], // Better aspect ratio for product images
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setProductData(prev => ({
          ...prev,
          picurl: result.assets[0].uri
        }));
        setErrors(prev => ({ ...prev, picurl: null }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced validation with better error messages
  const validateForm = () => {
    const newErrors = {};
    
    if (!productData.title.trim()) {
      newErrors.title = 'Product title is required';
    } else if (productData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (productData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!productData.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (productData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (productData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!productData.price.trim()) {
      newErrors.price = 'Current price is required';
    } else {
      const priceValue = parseInt(productData.price.replace(/[^0-9]/g, ''));
      if (isNaN(priceValue) || priceValue <= 0) {
        newErrors.price = 'Current price must be a valid positive number';
      }
    }

    if (!productData.pastPrice.trim()) {
      newErrors.pastPrice = 'Past price is required';
    } else {
      const pastPriceValue = parseInt(productData.pastPrice.replace(/[^0-9]/g, ''));
      if (isNaN(pastPriceValue) || pastPriceValue <= 0) {
        newErrors.pastPrice = 'Past price must be a valid positive number';
      }
    }

    if (!productData.category) {
      newErrors.category = 'Category is required';
    }

    if (!productData.region) {
      newErrors.region = 'Region is required';
    }

    if (!productData.picurl) {
      newErrors.picurl = 'Product image is required';
    }

    if (!addedId) {
      newErrors.auth = 'User authentication required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Improved price formatting
  const formatPrice = (priceValue) => {
    const numericPrice = parseInt(priceValue.replace(/[^0-9]/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return '';
    }
    return `${numericPrice.toLocaleString()} RWF`;
  };

  // Enhanced API call with better error handling
  const AddProduct = async () => {
    try {
      const token = await getItemAsync("authToken");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!addedId) {
        throw new Error("User ID not found");
      }

      const formattedPrice = formatPrice(productData.price);
      const formattedPastPrice = formatPrice(productData.pastPrice);

      // Validate formatted prices
      if (!formattedPrice || !formattedPastPrice) {
        throw new Error("Invalid price format");
      }

      const product = {
        farmer: addedId,
        title: productData.title.trim(),
        description: productData.description.trim(),
        current_price: formattedPrice,
        past_price: formattedPastPrice,
        img: productData.picurl,
        category: productData.category,
        region: productData.region,
      };

      console.log("Sending product data:", product);

      const response = await axios.post(
        "https://agrihub-backend-4z99.onrender.com/product",
        product,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log("Product added successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Add product failed:", error.response?.data || error.message);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error("Request timed out. Please check your internet connection.");
      } else if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid product data. Please check all fields.");
      } else if (error.response?.status === 413) {
        throw new Error("Image file is too large. Please select a smaller image.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to add product");
      }
    }
  };

  const handleAddProducts = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below.');
      return;
    }

    setIsSubmitting(true);

    try {
      await AddProduct();
      
      Alert.alert(
        'Success!',
        'Your product has been added successfully.',
        [
          { text: 'Add Another', onPress: resetForm },
          { text: 'View Products', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Upload Failed',
        error.message || 'There was an error adding your product. Please try again.',
        [
          { text: 'Retry', onPress: () => setIsSubmitting(false) },
          { text: 'Cancel', style: 'cancel', onPress: () => setIsSubmitting(false) },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setProductData({
      title: "",
      description: "",
      price: "",
      pastPrice: "",
      category: "",
      region: "",
      picurl: null,
    });
    setErrors({});
  };

  // Update product data
  const updateProductData = (field, value) => {
    setProductData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Improved price change handler
  const handlePriceChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    updateProductData('price', numericValue);
  };

  const handlePastPriceChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    updateProductData('pastPrice', numericValue);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.background}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: Colors.text }]}>
                Add New Product
              </Text>
              <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>
                Create a new product listing
              </Text>
            </View>

            {/* Image Upload Section */}
            <View style={[styles.imageSection, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}>
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                Product Image
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.imageUploadContainer,
                  {
                    borderColor: errors.picurl ? Colors.error : Colors.border,
                    backgroundColor: productData.picurl ? 'transparent' : Colors.background,
                  }
                ]}
                onPress={pickImage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
                      Processing image...
                    </Text>
                  </View>
                ) : productData.picurl ? (
                  <View style={styles.selectedImageContainer}>
                    <Image
                      style={styles.selectedImage}
                      source={{ uri: productData.picurl }}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <Text style={styles.changeImageText}>Tap to change</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Text style={[styles.uploadIcon, { color: Colors.primary }]}>📸</Text>
                    <Text style={[styles.uploadText, { color: Colors.textSecondary }]}>
                      Tap to select image
                    </Text>
                    <Text style={[styles.uploadSubtext, { color: Colors.textMuted }]}>
                      Recommended: 4:3 aspect ratio
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {errors.picurl && (
                <Text style={[styles.errorText, { color: Colors.error }]}>
                  {errors.picurl}
                </Text>
              )}
            </View>

            {/* Product Details Section */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                Product Details
              </Text>
              
              {/* Title Input */}
              <View style={styles.inputGroup}>
                <UploadTextInput
                  placeholder="Product title *"
                  value={productData.title}
                  onChangeText={(text) => updateProductData('title', text)}
                  style={[
                    styles.input,
                    { borderColor: errors.title ? Colors.error : Colors.border }
                  ]}
                  maxLength={100}
                />
                <View style={styles.inputMeta}>
                  <Text style={[styles.characterCount, { color: Colors.textMuted }]}>
                    {productData.title.length}/100
                  </Text>
                </View>
                {errors.title && (
                  <Text style={[styles.errorText, { color: Colors.error }]}>
                    {errors.title}
                  </Text>
                )}
              </View>

              {/* Description Input */}
              <View style={styles.inputGroup}>
                <UploadTextInput
                  placeholder="Product description *"
                  value={productData.description}
                  onChangeText={(text) => updateProductData('description', text)}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.input,
                    styles.textArea,
                    { borderColor: errors.description ? Colors.error : Colors.border }
                  ]}
                  maxLength={500}
                />
                <View style={styles.inputMeta}>
                  <Text style={[styles.characterCount, { color: Colors.textMuted }]}>
                    {productData.description.length}/500
                  </Text>
                </View>
                {errors.description && (
                  <Text style={[styles.errorText, { color: Colors.error }]}>
                    {errors.description}
                  </Text>
                )}
              </View>

              {/* Price Input */}
              <View style={styles.inputGroup}>
                <UploadTextInput
                  placeholder="Current Price (RWF) *"
                  keyboardType="numeric"
                  value={productData.price}
                  onChangeText={handlePriceChange}
                  style={[
                    styles.input,
                    { borderColor: errors.price ? Colors.error : Colors.border }
                  ]}
                />
                {productData.price && (
                  <Text style={[styles.pricePreview, { color: Colors.textSecondary }]}>
                    Preview: {formatPrice(productData.price)}
                  </Text>
                )}
                {errors.price && (
                  <Text style={[styles.errorText, { color: Colors.error }]}>
                    {errors.price}
                  </Text>
                )}
              </View>

              {/* Past Price Input */}
              <View style={styles.inputGroup}>
                <UploadTextInput
                  placeholder="Past Price (RWF) *"
                  keyboardType="numeric"
                  value={productData.pastPrice}
                  onChangeText={handlePastPriceChange}
                  style={[
                    styles.input,
                    { borderColor: errors.pastPrice ? Colors.error : Colors.border }
                  ]}
                />
                {productData.pastPrice && (
                  <Text style={[styles.pricePreview, { color: Colors.textSecondary }]}>
                    Preview: {formatPrice(productData.pastPrice)}
                  </Text>
                )}
                {errors.pastPrice && (
                  <Text style={[styles.errorText, { color: Colors.error }]}>
                    {errors.pastPrice}
                  </Text>
                )}
              </View>

              {/* Category Picker */}
              <View style={styles.inputGroup}>
                <Text style={[styles.pickerLabel, { color: Colors.text }]}>Category *</Text>
                <View style={[
                  styles.pickerWrapper,
                  { 
                    backgroundColor: Colors.cardBackground,
                    borderColor: errors.category ? Colors.error : Colors.border 
                  }
                ]}>
                  <Picker
                    selectedValue={productData.category}
                    onValueChange={(value) => updateProductData('category', value)}
                    style={[styles.picker, { color: Colors.text }]}
                  >
                    {categories.map((cat) => (
                      <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                    ))}
                  </Picker>
                </View>
                {errors.category && (
                  <Text style={[styles.errorText, { color: Colors.error }]}>
                    {errors.category}
                  </Text>
                )}
              </View>

              {/* Region Picker */}
              <View style={styles.inputGroup}>
                <Text style={[styles.pickerLabel, { color: Colors.text }]}>Region *</Text>
                <View style={[
                  styles.pickerWrapper,
                  { 
                    backgroundColor: Colors.cardBackground,
                    borderColor: errors.region ? Colors.error : Colors.border 
                  }
                ]}>
                  <Picker
                    selectedValue={productData.region}
                    onValueChange={(value) => updateProductData('region', value)}
                    style={[styles.picker, { color: Colors.text }]}
                  >
                    {regions.map((reg) => (
                      <Picker.Item key={reg.value} label={reg.label} value={reg.value} />
                    ))}
                  </Picker>
                </View>
                {errors.region && (
                  <Text style={[styles.errorText, { color: Colors.error }]}>
                    {errors.region}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title={isSubmitting ? "Adding Product..." : "ADD PRODUCT"}
                onPress={handleAddProducts}
                disabled={isSubmitting}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: isSubmitting ? Colors.textMuted : Colors.primary,
                  }
                ]}
              />
              
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: Colors.border }]}
                onPress={resetForm}
                disabled={isSubmitting}
              >
                <Text style={[styles.resetButtonText, { color: Colors.textSecondary }]}>
                  Clear Form
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Sections
  imageSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  // Image Upload
  imageUploadContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    alignItems: 'center',
  },
  changeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
  },
  
  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  pricePreview: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Pickers
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  
  // Buttons
  buttonContainer: {
    marginTop: 32,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  resetButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Error handling
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});