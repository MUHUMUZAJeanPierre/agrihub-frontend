import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { jwtDecode } from 'jwt-decode';
import UploadTextInput from '../../Components/uploadtextInpu';
import Button from '../../Components/Button';

const { width, height } = Dimensions.get('window');

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

const ProductManagementScreen = () => {
  const { theme } = useTheme();
  const colors = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.light, [theme]);
  const navigation = useNavigation();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Add product form state
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    pastPrice: '',
    category: '',
    region: '',
    picurl: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(null);

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Vegetables', value: 'vegetables' },
    { label: 'Fruits', value: 'fruits' },
    { label: 'Grains', value: 'grains' },
    { label: 'Tubers', value: 'tubers' },
    { label: 'Legumes', value: 'legumes' },
    { label: 'Seeds', value: 'seeds' },
    { label: 'Herbs', value: 'herbs' },
    { label: 'Oil Crops', value: 'oil_crops' },
    { label: 'Cereals', value: 'cereals' },
    { label: 'Packaged', value: 'packaged' },
  ];

  const regions = [
    { label: 'Select Region', value: '' },
    { label: 'Kigali', value: 'Kigali' },
    { label: 'Eastern Province', value: 'Eastern' },
    { label: 'Western Province', value: 'Western' },
    { label: 'Northern Province', value: 'Northern' },
    { label: 'Southern Province', value: 'Southern' },
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

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          const decoded = jwtDecode(token);
          const userIdFromToken = decoded?.id;
          if (userIdFromToken) {
            setUserId(userIdFromToken);
          }
        }
        
        const storedUserId = await AsyncStorage.getItem('@user_id');
        if (storedUserId && !userId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Fetch products
  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        console.warn('No auth token found.');
        return;
      }

      const res = await axios.get('https://agrihub-backend-4z99.onrender.com/product/my-products', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = res.data?.data;
      if (Array.isArray(result)) {
        setProducts(result);
      } else {
        console.warn('Unexpected response structure:', res.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch my products:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to load your products.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyProducts();
    }, [])
  );

  // Handle delete product
  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('@auth_token');
            await axios.delete(`https://agrihub-backend-4z99.onrender.com/product/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setProducts((prev) => prev.filter((p) => p._id !== id));
          } catch (err) {
            Alert.alert('Delete Error', err.response?.data?.message || 'Failed to delete.');
          }
        },
      },
    ]);
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductData({
      title: product.title,
      description: product.description || '',
      price: product.current_price.replace(/[^0-9]/g, ''),
      pastPrice: product.past_price.replace(/[^0-9]/g, ''),
      category: product.category,
      region: product.region,
      picurl: product.img,
    });
    setShowAddModal(true);
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyProducts();
    setRefreshing(false);
  };

  // Image picker
  const pickImage = async () => {
    try {
      setIsLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setProductData(prev => ({
          ...prev,
          picurl: result.assets[0].uri,
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!productData.title.trim()) {
      newErrors.title = 'Product title is required';
    } else if (productData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!productData.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (productData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format price
  const formatPrice = (priceValue) => {
    const numericPrice = parseInt(priceValue.replace(/[^0-9]/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return '';
    }
    return `${numericPrice.toLocaleString()} RWF`;
  };

  // Add/Update product
  const handleSubmitProduct = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('@auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formattedPrice = formatPrice(productData.price);
      const formattedPastPrice = formatPrice(productData.pastPrice);

      const product = {
        title: productData.title.trim(),
        description: productData.description.trim(),
        current_price: formattedPrice,
        past_price: formattedPastPrice,
        img: productData.picurl,
        category: productData.category,
        region: productData.region,
      };

      let response;
      if (editingProduct) {
        // Update product
        response = await axios.put(
          `https://agrihub-backend-4z99.onrender.com/product/${editingProduct._id}`,
          product,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
          }
        );
      } else {
        // Add new product
        response = await axios.post(
          'https://agrihub-backend-4z99.onrender.com/product',
          product,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
          }
        );
      }

      Alert.alert(
        'Success!',
        editingProduct ? 'Product updated successfully!' : 'Product added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              setShowAddModal(false);
              fetchMyProducts();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Submit product failed:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to submit product'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setProductData({
      title: '',
      description: '',
      price: '',
      pastPrice: '',
      category: '',
      region: '',
      picurl: null,
    });
    setErrors({});
    setEditingProduct(null);
  };

  // Update product data
  const updateProductData = (field, value) => {
    setProductData(prev => ({ ...prev, [field]: value.trimStart() }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Price change handlers
  const handlePriceChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    updateProductData('price', numericValue);
  };

  const handlePastPriceChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    updateProductData('pastPrice', numericValue);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Render product item
  const renderProductItem = ({ item }) => (
    <Animated.View style={[
      styles.productCard,
      {
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }
    ]}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.img }} style={styles.productImage} />
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      
      <View style={styles.productDetails}>
        <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.currentPrice, { color: colors.success }]}>
            {item.current_price}
          </Text>
          <Text style={[styles.pastPrice, { color: colors.textMuted }]}>
            {item.past_price}
          </Text>
        </View>
        
        <View style={styles.productActions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            style={[styles.actionButton, { backgroundColor: colors.error }]}
          >
            <Ionicons name="trash-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="basket-outline" size={80} color={colors.textMuted} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Products Found</Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
        {searchQuery || selectedCategory !== 'all' 
          ? 'Try adjusting your search or filter'
          : 'Start by adding your first product'}
      </Text>
    </View>
  );

  // Render add product modal
  const renderAddProductModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        resetForm();
        setShowAddModal(false);
      }}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => {
              resetForm();
              setShowAddModal(false);
            }}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Text>
          
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContainer}
          >
            {/* Image Upload Section */}
            <View style={styles.imageSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Image</Text>
              
              <TouchableOpacity
                style={[
                  styles.imageUploadContainer,
                  {
                    borderColor: errors.picurl ? colors.error : colors.border,
                    backgroundColor: productData.picurl ? 'transparent' : colors.cardBackground,
                  }
                ]}
                onPress={pickImage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
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
                      <Ionicons name="camera" size={24} color="white" />
                      <Text style={styles.changeImageText}>Tap to change</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="image-outline" size={48} color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                      Tap to select image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {errors.picurl && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.picurl}
                </Text>
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.formFields}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Product Title *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: errors.title ? colors.error : colors.border,
                      color: colors.text,
                    }
                  ]}
                  placeholder="Enter product title"
                  placeholderTextColor={colors.placeholder}
                  value={productData.title}
                  onChangeText={(text) => updateProductData('title', text)}
                  maxLength={100}
                />
                {errors.title && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.title}
                  </Text>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Description *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: errors.description ? colors.error : colors.border,
                      color: colors.text,
                    }
                  ]}
                  placeholder="Enter product description"
                  placeholderTextColor={colors.placeholder}
                  value={productData.description}
                  onChangeText={(text) => updateProductData('description', text)}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                {errors.description && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.description}
                  </Text>
                )}
              </View>

              {/* Price Row */}
              <View style={styles.priceRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Current Price *</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: errors.price ? colors.error : colors.border,
                        color: colors.text,
                      }
                    ]}
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                    value={productData.price}
                    onChangeText={handlePriceChange}
                    keyboardType="numeric"
                  />
                  {errors.price && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.price}
                    </Text>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Past Price *</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: errors.pastPrice ? colors.error : colors.border,
                        color: colors.text,
                      }
                    ]}
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                    value={productData.pastPrice}
                    onChangeText={handlePastPriceChange}
                    keyboardType="numeric"
                  />
                  {errors.pastPrice && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.pastPrice}
                    </Text>
                  )}
                </View>
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Category *</Text>
                <View style={[
                  styles.pickerWrapper,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: errors.category ? colors.error : colors.border,
                  }
                ]}>
                  <Picker
                    selectedValue={productData.category}
                    onValueChange={(value) => updateProductData('category', value)}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    {categories.filter(cat => cat.value !== 'all').map((cat) => (
                      <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                    ))}
                  </Picker>
                </View>
                {errors.category && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.category}
                  </Text>
                )}
              </View>

              {/* Region */}
              <View style={styles.inputGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Region *</Text>
                <View style={[
                  styles.pickerWrapper,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: errors.region ? colors.error : colors.border,
                  }
                ]}>
                  <Picker
                    selectedValue={productData.region}
                    onValueChange={(value) => updateProductData('region', value)}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    {regions.map((region) => (
                      <Picker.Item key={region.value} label={region.label} value={region.value} />
                    ))}
                  </Picker>
                </View>
                {errors.region && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.region}
                  </Text>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: isSubmitting ? colors.textMuted : colors.primary,
                }
              ]}
              onPress={handleSubmitProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading your products...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
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
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Products</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {products.length} product{products.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search products..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={[styles.filterContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              style={[styles.filterPicker, { color: colors.text }]}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Products List */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      </Animated.View>

      {renderAddProductModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: 120,
  },
  filterPicker: {
    height: 48,
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  productDetails: {
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pastPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageUploadContainer: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImageContainer: {
    position: 'relative',
    height: '100%',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    marginTop: 8,
  },
  formFields: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priceRow: {
    flexDirection: 'row',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductManagementScreen;