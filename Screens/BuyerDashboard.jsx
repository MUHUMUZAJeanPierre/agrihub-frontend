import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../contexts/CartContext';

// API Configuration
const API_CONFIG = {
  PRODUCT_BASE_URL: 'https://agrihub-backend-4z99.onrender.com/product',
  CART_BASE_URL: 'https://agrihub-backend-4z99.onrender.com/cart',
  TIMEOUT: 10000,
};

// Auth Storage Keys
const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

const Colors = {
  primary: '#4A90E2',
  primaryDark: '#2D5AA0',
  secondary: '#FF6B35',
  accent: '#FFA726',
  
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceLight: '#F0F0F0',
  
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  
  cardBackground: '#FFFFFF',
  inputBackground: '#F5F5F5',
  borderColor: '#E0E0E0',
  
  gradient: ['#4A90E2', '#357ABD'],
  orangeGradient: ['#FF6B35', '#FF8A50'],
};

// Categories matching the design
const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline', color: Colors.primary },
  { id: 'fruits', name: 'Fruits', icon: 'nutrition-outline', color: Colors.accent },
  { id: 'dairy', name: 'Dairy', icon: 'water-outline', color: Colors.primary },
  { id: 'vegetables', name: 'Veggies', icon: 'leaf-outline', color: Colors.success },
  { id: 'meat', name: 'Meat', icon: 'restaurant-outline', color: Colors.error },
  { id: 'tubers', name: 'Tubers', icon: 'flower-outline', color: Colors.warning },
];

const BuyerDashboard = ({ navigation }) => {
  // State Management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [favorites, setFavorites] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const { width, height } = Dimensions.get('window');
  
  // Use CartContext instead of local state
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

  
  const getAuthToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_KEYS.TOKEN);
      const storedUserId = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      
      console.log('🔑 Retrieved token:', token ? 'Token exists' : 'No token');
      console.log('👤 Retrieved userId:', storedUserId);
      
      setAuthToken(token);
      setUserId(storedUserId);
      return token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  }, []);

  const handleAuthError = useCallback(() => {
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => {
            AsyncStorage.multiRemove([AUTH_KEYS.TOKEN, AUTH_KEYS.USER_ID, AUTH_KEYS.USER_DATA]);
            navigation.navigate('Login');
          }
        }
      ]
    );
  }, [navigation]);

  const createAuthenticatedClient = useCallback((baseURL) => {
    return axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }, []);

  const productApiClient = useMemo(() => createAuthenticatedClient(API_CONFIG.PRODUCT_BASE_URL), [createAuthenticatedClient]);
  const cartApiClient = useMemo(() => createAuthenticatedClient(API_CONFIG.CART_BASE_URL), [createAuthenticatedClient]);

  // Add request interceptor to include auth token
  useEffect(() => {
    const addAuthInterceptor = (client) => {
      client.interceptors.request.use(
        async (config) => {
          const token = authToken || await getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          
          if (userId) {
            config.headers['x-user-id'] = userId;
          }
          
          console.log('🔄 Request URL:', config.url);
          console.log('🔑 Auth header:', config.headers.Authorization ? 'Present' : 'Missing');
          
          return config;
        },
        (error) => {
          console.error('❌ Request interceptor error:', error);
          return Promise.reject(error);
        }
      );

      client.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            console.error('❌ 401 Unauthorized - clearing auth data');
            handleAuthError();
          }
          return Promise.reject(error);
        }
      );
    };

    if (authToken) {
      addAuthInterceptor(productApiClient);
      addAuthInterceptor(cartApiClient);
    }
  }, [authToken, userId, productApiClient, cartApiClient, getAuthToken, handleAuthError]);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching products from API...');
      const response = await axios.get(API_CONFIG.PRODUCT_BASE_URL, {
        timeout: API_CONFIG.TIMEOUT,
      });
      
      console.log('✅ Products fetched successfully:', response.data?.length || 0);
      
      // Transform API data to match component structure
      const transformedProducts = response.data.map(product => ({
        ...product,
        price: product.current_price,
        pricePerKg: 'kg', // Default unit
        isPopular: product.category === 'fruits', // Mark fruits as popular for demo
      }));
      
      setProducts(transformedProducts);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      
      // Show user-friendly error
      Alert.alert(
        'Error Loading Products',
        'Unable to load products. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: fetchProducts },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized filtered products by category and search
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Get popular fruits (first 6 fruits from API)
  const popularFruits = useMemo(() => {
    return products
      .filter(product => product.category === 'fruits')
      .slice(0, 6);
  }, [products]);

  // Get products by category for display
  const getProductsByCategory = useCallback((category) => {
    if (category === 'all') return products;
    return products.filter(product => 
      product.category?.toLowerCase() === category.toLowerCase()
    );
  }, [products]);

  // Cart calculations using CartContext
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.current_price?.replace(/[^\d.]/g, '') || item.price?.replace(/[^\d.]/g, '') || '0');
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Initialize app and fetch data
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing app...');
      await getAuthToken();
      await fetchProducts();
    };

    initializeApp();
  }, [getAuthToken, fetchProducts]);

  // Enhanced addToCart function with loading state
  const handleAddToCart = useCallback(async (product) => {
    try {
      setAddingToCart(product._id);
      
      // Use CartContext addToCart
      addToCart(product);
      
      Alert.alert(
        '✅ Added to Cart', 
        `${product.title} has been added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { 
            text: 'View Cart', 
            onPress: () => setIsCartVisible(true) 
          }
        ]
      );
    } catch (err) {
      console.error('❌ Add to cart error:', err);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  }, [addToCart]);

  // Remove item from cart
  const handleRemoveFromCart = useCallback((productId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromCart(productId)
        }
      ]
    );
  }, [removeFromCart]);

  // Update item quantity
  const handleUpdateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  }, [updateQuantity, handleRemoveFromCart]);

  const toggleFavorite = useCallback(async (productId) => {
    try {
      const isFavorite = favorites.includes(productId);
      
      if (isFavorite) {
        setFavorites(prev => prev.filter(id => id !== productId));
      } else {
        setFavorites(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error('❌ Toggle favorite error:', err);
    }
  }, [favorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProducts();
    } catch (error) {
      console.error('❌ Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProducts]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  // Enhanced Product Card Component
  const ProductCard = React.memo(({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ProductDetailScreen', {
          product: item,
          allProducts: products,
        })
      }
    >
      <View style={styles.imageContainer}>
        {item.img ? (
          <Image 
            source={{ uri: item.img }} 
            style={styles.productImage}
            onError={() => console.log('Image load error for:', item.title)}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={48} color={Colors.textTertiary} />
          </View>
        )}
        
        {/* Price Discount Badge */}
        {item.past_price && item.current_price && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((parseFloat(item.past_price.replace(/[^\d.]/g, '')) - 
                           parseFloat(item.current_price.replace(/[^\d.]/g, ''))) / 
                          parseFloat(item.past_price.replace(/[^\d.]/g, ''))) * 100)}% OFF
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation(); 
            handleAddToCart(item);
          }}
          disabled={addingToCart === item._id}
          activeOpacity={0.8}
        >
          {addingToCart === item._id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={18} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item._id);
          }}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={favorites.includes(item._id) ? "heart" : "heart-outline"} 
            size={16} 
            color={favorites.includes(item._id) ? Colors.error : Colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {item.current_price || item.price}
            {item.pricePerKg && <Text style={styles.priceUnit}> /{item.pricePerKg}</Text>}
          </Text>
          {item.past_price && (
            <Text style={styles.oldPrice}>{item.past_price}</Text>
          )}
        </View>
        {item.region && (
          <Text style={styles.productRegion} numberOfLines={1}>
            📍 {item.region}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  ));

  // Category Card Component
  const CategoryCard = React.memo(({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategoryCard
      ]}
      onPress={() => handleCategorySelect(item.id)}
      activeOpacity={0.8}
    >
      <View style={[
        styles.categoryIcon, 
        { backgroundColor: item.color + '20' },
        selectedCategory === item.id && { backgroundColor: item.color }
      ]}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={selectedCategory === item.id ? '#fff' : item.color} 
        />
      </View>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && styles.selectedCategoryName
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ));

  // Cart Item Component
  const CartItemCard = React.memo(({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.img }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemTitle}>{item.title}</Text>
        <Text style={styles.cartItemPrice}>{item.current_price || item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveFromCart(item._id)}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  ));

  // Loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  // Error screen
  if (error && products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color={Colors.error} />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>Welcome!</Text>
              <Text style={styles.headerName}>Aminur tahmid</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileIcon}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search what do you want?"
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Promotion Banner */}
        <View style={styles.promotionBanner}>
          <View style={styles.promotionContent}>
            <Text style={styles.promotionDiscount}>35% OFF</Text>
            <Text style={styles.promotionText}>
              On your first order from the app and get discount
            </Text>
            <TouchableOpacity style={styles.orderNowButton}>
              <Text style={styles.orderNowText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promotionImageContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200' }}
              style={styles.promotionImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} item={category} />
            ))}
          </ScrollView>
        </View>

        {/* Popular Fruits or Filtered Products */}
        {selectedCategory === 'all' && !searchQuery ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Fruits</Text>
              <TouchableOpacity onPress={() => handleCategorySelect('fruits')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            >
              {popularFruits.map((fruit) => (
                <ProductCard key={fruit._id} item={fruit} />
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery ? `Search Results (${filteredProducts.length})` : 
                 selectedCategory === 'all' ? 'All Products' : 
                 categories.find(c => c.id === selectedCategory)?.name || 'Products'}
              </Text>
            </View>
            
            {filteredProducts.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} item={product} />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyResults}>
                <Ionicons name="search-outline" size={60} color={Colors.textSecondary} />
                <Text style={styles.emptyResultsTitle}>No products found</Text>
                <Text style={styles.emptyResultsText}>
                  {searchQuery ? 
                    `No results for "${searchQuery}"` : 
                    `No products in ${categories.find(c => c.id === selectedCategory)?.name || 'this category'}`
                  }
                </Text>
              </View>
            )}
          </View>
        )}

        {/* All Products Section (when no category selected) */}
        {selectedCategory === 'all' && !searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Products</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            >
              {products.slice(0, 10).map((product) => (
                <ProductCard key={product._id} item={product} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Floating Cart Icon */}
      <TouchableOpacity 
        style={styles.cartIcon} 
        onPress={() => setIsCartVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.cartIconContainer}>
          <Ionicons name="bag-outline" size={24} color="#fff" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Enhanced Cart Modal */}
      <Modal visible={isCartVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Shopping Cart ({cartItemCount})</Text>
            <TouchableOpacity 
              onPress={() => setIsCartVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="bag-outline" size={80} color={Colors.textSecondary} />
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtitle}>Add items to get started</Text>
              <TouchableOpacity 
                style={styles.shopNowBtn} 
                onPress={() => setIsCartVisible(false)}
              >
                <Text style={styles.shopNowBtnText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cartContent}>
              <ScrollView style={styles.cartItems}>
                {cartItems.map((item) => (
                  <CartItemCard key={item._id} item={item} />
                ))}
              </ScrollView>
              
              <View style={styles.cartFooter}>
                <View style={styles.cartSummary}>
                  <View style={styles.cartTotal}>
                    <Text style={styles.cartTotalLabel}>Total ({cartItemCount} items):</Text>
                    <Text style={styles.cartTotalAmount}>RWF {cartTotal.toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.clearCartButton}
                    onPress={() => {
                      Alert.alert(
                        'Clear Cart',
                        'Are you sure you want to remove all items from your cart?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Clear', 
                            style: 'destructive',
                            onPress: clearCart
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.clearCartText}>Clear Cart</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.checkoutBtn}>
                  <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerGreeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  // headerName: {
  //   fontSize: 18,
  //   fontWeight: '600',
    headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
  },

  // Promotion Banner
  promotionBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  promotionContent: {
    flex: 1,
  },
  promotionDiscount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  promotionText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 18,
  },
  orderNowButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  orderNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
  promotionImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionImage: {
    width: 70,
    height: 70,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
  },
  selectedCategoryCard: {
    // Additional styling for selected category
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedCategoryName: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },

  // Products
  productsContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  productCard: {
    width: 160,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  oldPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  productRegion: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Empty Results
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyResultsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Floating Cart
  cartIcon: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  cartIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },

  // Empty Cart
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyCartSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  shopNowBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  shopNowBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Cart Content
  cartContent: {
    flex: 1,
  },
  cartItems: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },

  // Cart Footer
  cartFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTotal: {
    flex: 1,
  },
  cartTotalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cartTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clearCartButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.surface,
  },
  clearCartText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BuyerDashboard;