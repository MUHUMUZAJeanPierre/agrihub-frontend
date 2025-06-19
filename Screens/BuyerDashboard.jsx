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
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add this dependency

const { width, height } = Dimensions.get('window');

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
  primary: '#2D5016', 
  primaryLight: '#4A7C59',
  primaryDark: '#1B3209',
  
  secondary: '#8B4513', 
  secondaryLight: '#CD853F', 
  accent: '#FF8C42', 
  accentLight: '#FFB347', 
  
  fresh: '#32CD32', 
  mint: '#98FB98', 
  
  background: '#F8FBF6', 
  surface: '#FFFFFF',
  surfaceElevated: '#FEFFFE',
  
  textPrimary: '#1B3209',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  textLight: '#A0AEC0',
  
  // Status colors
  success: '#48BB78',
  warning: '#ED8936',
  error: '#F56565',
  info: '#4299E1',
  
  // Shadows and borders
  shadow: 'rgba(45, 80, 22, 0.1)',
  border: '#E8F5E8',
  borderLight: '#F0F8F0',
};

// Constants with enhanced categories
const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: 'grid-outline', color: Colors.primary },
  { id: 'organic', name: 'Organic', icon: 'leaf-outline', color: Colors.fresh },
  { id: 'vegetables', name: 'Vegetables', icon: 'nutrition-outline', color: Colors.success },
  { id: 'fruits', name: 'Fruits', icon: 'flower-outline', color: Colors.accent },
  { id: 'seeds', name: 'Seeds', icon: 'ellipse-outline', color: Colors.secondary },
  { id: 'dairy', name: 'Dairy', icon: 'water-outline', color: Colors.info },
  { id: 'grains', name: 'Grains', icon: 'layers-outline', color: Colors.warning },
  { id: 'meat', name: 'Meat', icon: 'restaurant-outline', color: Colors.error },
  { id: 'beverages', name: 'Beverages', icon: 'wine-outline', color: Colors.primaryLight }
];

const BuyerDashboard = ({ navigation }) => {
  // State Management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [cartItems, setCartItems] = useState([]);
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
            // Clear stored auth data
            AsyncStorage.multiRemove([AUTH_KEYS.TOKEN, AUTH_KEYS.USER_ID, AUTH_KEYS.USER_DATA]);
            // Navigate to login screen
            navigation.navigate('Login'); // Adjust route name as needed
          }
        }
      ]
    );
  }, [navigation]);

  // Create API clients with authentication
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
            // Alternative formats that might be expected:
            // config.headers.Authorization = `Token ${token}`;
            // config.headers['x-auth-token'] = token;
          }
          
          // Add userId if required by your backend
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

      // Add response interceptor to handle auth errors
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

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    return products.filter(product =>
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Cart calculations
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price?.replace(/[^\d.]/g, '')) || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Product API Functions
  const fetchProducts = useCallback(async (category = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const url = category === 'all' ? '' : `/category/${category}`;
      const response = await productApiClient.get(url);
      
      if (response.data) {
        setProducts(response.data);
        updateCategoriesFromProducts(response.data);
      }
    } catch (err) {
      console.error('❌ Product fetch error:', err);
      setError('Failed to load products. Please check your connection.');
      
      if (err.code === 'NETWORK_ERROR') {
        Alert.alert(
          'Connection Error',
          'Unable to connect to server. Would you like to retry?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => fetchProducts(category) }
          ]
        );
      } else if (err.response?.status === 401) {
        handleAuthError();
      } else {
        Alert.alert('Error', 'Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [productApiClient, handleAuthError]);

  // Enhanced Cart API Functions with better error handling
  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      console.log('🛒 Fetching cart with auth...');
      
      // Ensure we have a token before making the request
      const token = authToken || await getAuthToken();
      if (!token) {
        console.log('❌ No auth token available for cart fetch');
        setCartItems([]);
        return;
      }
      
      const response = await cartApiClient.get('/');
      console.log('📦 Cart response status:', response.status);
      console.log('📦 Cart response data:', response.data);
      
      if (response.data && response.data.success) {
        const cartData = response.data.data || response.data.cart || [];
        
        // Transform cart data to match your component structure
        const transformedCartItems = cartData.map(item => ({
          id: item.productId || item._id,
          _id: item.productId || item._id,
          title: item.product?.title || item.title || 'Unknown Product',
          price: item.product?.price || item.price || 'RWF 0',
          img: item.product?.img || item.img || null,
          region: item.product?.region || item.region || '',
          farmer: item.product?.farmer || item.farmer || '',
          quantity: item.quantity || 1,
          category: item.product?.category || item.category || '',
        }));
        
        console.log('✅ Transformed cart items:', transformedCartItems.length);
        setCartItems(transformedCartItems);
      } else {
        console.log('📦 Empty cart response');
        setCartItems([]);
      }
    } catch (err) {
      console.error('❌ Cart fetch error:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        url: err.config?.url
      });
      
      if (err.response?.status === 401) {
        console.log('❌ 401 error - handling auth error');
        handleAuthError();
      } else {
        // Don't show error for cart fetch as it might be empty initially
        setCartItems([]);
      }
    } finally {
      setCartLoading(false);
    }
  }, [cartApiClient, authToken, getAuthToken, handleAuthError]);

  
  const addToCart = useCallback(async (product) => {
  try {
    setAddingToCart(product._id); // Indicating that the item is being added to the cart

    console.log('➕ Adding to cart:', product._id);

    // Ensure we have an authentication token
    const token = authToken || await getAuthToken();
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to add items to the cart.');
      return;
    }

    const requestData = {
      productId: product._id,
      quantity: 1, 
    };

    if (userId) {
      requestData.userId = userId;
    }

    console.log('📤 Add to cart request:', requestData);

    const response = await cartApiClient.post('/add', requestData);

    console.log('📥 Add to cart response:', response.data);

    if (response.data && response.data.success) {
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

      await fetchCart();
    } else {
      throw new Error(response.data?.message || 'Failed to add to cart');
    }
  } catch (err) {
    console.error('❌ Add to cart error:', err);

    if (err.response?.status === 401) {
      handleAuthError();
    } else {
      Alert.alert(
        'Error', 
        err.response?.data?.message || 'Failed to add to cart. Please try again.'
      );
    }
  } finally {
    setAddingToCart(null); 
  }
}, [authToken, userId, cartApiClient, getAuthToken, fetchCart, handleAuthError]);




  const updateCartQuantity = useCallback(async (productId, quantity) => {
    try {
      console.log('🔄 Updating cart quantity:', productId, quantity);
      
      // Ensure we have a token
      const token = authToken || await getAuthToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to update cart.');
        return;
      }
      
      // Optimistic update
      setCartItems(prev => prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
      
      const requestData = { 
        productId, 
        quantity 
      };
      
      // Add userId if your backend requires it
      if (userId) {
        requestData.userId = userId;
      }
      
      const response = await cartApiClient.put('/update', requestData);
      
      console.log('📝 Update cart response:', response.data);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to update quantity');
      }
    } catch (err) {
      console.error('❌ Update cart error:', err);
      
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        Alert.alert('Error', 'Failed to update quantity. Please try again.');
      }
      
      // Revert optimistic update
      await fetchCart();
    }
  }, [cartApiClient, authToken, userId, getAuthToken, handleAuthError, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      console.log('🗑️ Removing from cart:', productId);
      
      // Ensure we have a token
      const token = authToken || await getAuthToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to remove items.');
        return;
      }
      
      // Optimistic update
      setCartItems(prev => prev.filter(item => item.id !== productId));
      
      const response = await cartApiClient.delete(`/remove/${productId}`);
      console.log('🗑️ Remove from cart response:', response.data);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to remove item');
      }
    } catch (err) {
      console.error('❌ Remove from cart error:', err);
      
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        Alert.alert('Error', 'Failed to remove item. Please try again.');
      }
      
      // Revert optimistic update
      await fetchCart();
    }
  }, [cartApiClient, authToken, getAuthToken, handleAuthError, fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      console.log('🧹 Clearing cart...');
      
      // Ensure we have a token
      const token = authToken || await getAuthToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to clear cart.');
        return;
      }
      
      const response = await cartApiClient.delete('/clear');
      console.log('🧹 Clear cart response:', response.data);
      
      if (response.data && response.data.success) {
        setCartItems([]);
        Alert.alert('Success', 'Cart cleared successfully');
      } else {
        throw new Error(response.data?.message || 'Failed to clear cart');
      }
    } catch (err) {
      console.error('❌ Clear cart error:', err);
      
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        Alert.alert('Error', 'Failed to clear cart. Please try again.');
      }
    }
  }, [cartApiClient, authToken, getAuthToken, handleAuthError]);

  // Other utility functions remain the same
  const fetchFavorites = useCallback(async () => {
    try {
      const response = await productApiClient.get('/favorites');
      setFavorites(response.data?.map(item => item._id) || []);
    } catch (err) {
      console.error('❌ Favorites fetch error:', err);
      if (err.response?.status === 401) {
        handleAuthError();
      }
    }
  }, [productApiClient, handleAuthError]);

  const updateCategoriesFromProducts = useCallback((productsData) => {
    const uniqueCategories = [...new Set(
      productsData.map(product => product.category).filter(Boolean)
    )];
    
    const dynamicCategories = uniqueCategories.map(category => ({
      id: category,
      name: getCategoryDisplayName(category),
      icon: getCategoryIcon(category),
      color: getCategoryColor(category)
    }));
    
    setCategories([CATEGORIES[0], ...dynamicCategories]);
  }, []);

  const getCategoryDisplayName = useCallback((category) => {
    const categoryMap = {
      'organic': 'Organic',
      'vegetables': 'Vegetables', 
      'fruits': 'Fruits',
      'seeds': 'Seeds',
      'dairy': 'Dairy',
      'grains': 'Grains',
      'meat': 'Meat',
      'beverages': 'Beverages'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }, []);

  const getCategoryIcon = useCallback((category) => {
    const iconMap = {
      'organic': 'leaf-outline',
      'vegetables': 'nutrition-outline',
      'fruits': 'flower-outline',
      'seeds': 'ellipse-outline',
      'dairy': 'water-outline',
      'grains': 'layers-outline',
      'meat': 'restaurant-outline',
      'beverages': 'wine-outline'
    };
    return iconMap[category] || 'grid-outline';
  }, []);

  const getCategoryColor = useCallback((category) => {
    const colorMap = {
      'organic': Colors.fresh,
      'vegetables': Colors.success,
      'fruits': Colors.accent,
      'seeds': Colors.secondary,
      'dairy': Colors.info,
      'grains': Colors.warning,
      'meat': Colors.error,
      'beverages': Colors.primaryLight
    };
    return colorMap[category] || Colors.primary;
  }, []);

  const handleCategorySelect = useCallback(async (categoryId) => {
    if (categoryId === selectedCategory) return;
    
    setSelectedCategory(categoryId);
    await fetchProducts(categoryId);
  }, [selectedCategory, fetchProducts]);

  const toggleFavorite = useCallback(async (productId) => {
    try {
      const isFavorite = favorites.includes(productId);
      
      if (isFavorite) {
        setFavorites(prev => prev.filter(id => id !== productId));
        await productApiClient.delete(`/favorites/${productId}`);
      } else {
        setFavorites(prev => [...prev, productId]);
        await productApiClient.post('/favorites', { productId });
      }
    } catch (err) {
      console.error('❌ Toggle favorite error:', err);
      
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        Alert.alert('Error', 'Failed to update favorites. Please try again.');
        fetchFavorites();
      }
    }
  }, [favorites, productApiClient, fetchFavorites, handleAuthError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchProducts(selectedCategory),
        fetchCart(),
        fetchFavorites()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategory, fetchProducts, fetchCart, fetchFavorites]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }
    
    Alert.alert(
      'Checkout',
      `Total: RWF ${cartTotal.toLocaleString('en-US')}\nProceed to checkout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          onPress: () => {
            // Navigate to checkout screen or handle checkout
            console.log('Proceeding to checkout...');
          }
        }
      ]
    );
  }, [cartItems, cartTotal]);

  // Initialize auth and fetch data
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing app...');
      await getAuthToken();
      
      // Fetch data after getting auth token
      await Promise.all([
        fetchProducts(),
        fetchCart(),
        fetchFavorites()
      ]);
    };

    initializeApp();
  }, []);

  const ProductCard = React.memo(({ item }) => (
    <TouchableOpacity 
      style={[styles.productCard, item.isFlashDeal && styles.flashDealCard]}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      activeOpacity={0.8}
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
            <Ionicons name="image-outline" size={48} color={Colors.textLight} />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        {item.isFlashDeal && (
          <View style={styles.flashDealBadge}>
            <Ionicons name="flash" size={12} color="#fff" />
            <Text style={styles.flashDealText}>FLASH</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.addButton, item.isFlashDeal && styles.flashDealAddButton]}
          onPress={(e) => {
            e.stopPropagation(); 
            addToCart(item);
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
            size={18} 
            color={favorites.includes(item._id) ? Colors.error : Colors.textLight} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        
        {item.region && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>{item.region}</Text>
          </View>
        )}
        
        {item.farmer && (
          <View style={styles.farmerContainer}>
            <Ionicons name="person-outline" size={12} color={Colors.primaryLight} />
            <Text style={styles.farmerText} numberOfLines={1}>{item.farmer}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ));

  // Enhanced Empty State Component
  const EmptyState = React.memo(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="leaf-outline" size={80} color={Colors.primaryLight} />
      </View>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No products found' : 'No products available'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try using different keywords or categories' 
          : 'New products coming soon'
        }
      </Text>
      {searchQuery && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
          <Text style={styles.clearSearchText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  ));

  // Enhanced Cart Item Component
  const CartItem = React.memo(({ item }) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.cartItem}
      onPress={() => {
        setIsCartVisible(false);
        navigation.navigate('ProductDetail', { product: item });
      }}
      activeOpacity={0.8}
    >
      {item.img ? (
        <Image source={{ uri: item.img }} style={styles.cartItemImage} />
      ) : (
        <View style={styles.cartItemPlaceholder}>
          <Ionicons name="image-outline" size={24} color={Colors.textLight} />
        </View>
      )}
      <View style={styles.cartItemInfo}>
        <View style={styles.cartItemHeader}>
          <Text style={styles.cartItemTitle} numberOfLines={2}>{item.title}</Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              setIsCartVisible(false);
              navigation.navigate('ProductDetail', { product: item });
            }}
            style={styles.cartItemViewButton}
          >
            <Ionicons name="eye-outline" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cartItemPrice}>{item.price}</Text>
        {item.region && (
          <View style={styles.cartItemLocationContainer}>
            <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.cartItemRegion}>{item.region}, Rwanda</Text>
          </View>
        )}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Umubare: </Text>
          <View style={styles.cartActions}>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                item.quantity > 1
                  ? updateCartQuantity(item.id, item.quantity - 1)
                  : removeFromCart(item.id);
              }}
              style={[styles.quantityButton, styles.quantityButtonLeft]}
            >
              <Ionicons 
                name={item.quantity > 1 ? "remove" : "trash-outline"} 
                size={16} 
                color={item.quantity > 1 ? Colors.textSecondary : Colors.error} 
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                updateCartQuantity(item.id, item.quantity + 1);
              }}
              style={[styles.quantityButton, styles.quantityButtonRight]}
            >
              <Ionicons name="add" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ));

  // Loading screen
  if (loading && !authToken) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingIconContainer}>
            <Ionicons name="leaf-outline" size={60} color={Colors.primary} />
            <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingSpinner} />
          </View>
          <Text style={styles.loadingTitle}>Loading products...</Text>
          <Text style={styles.loadingSubtitle}>Finding fresh products for you</Text>
        </View>
      </View>
    );
  }

  // Error screen
  if (error && products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="cloud-offline-outline" size={80} color={Colors.error} />
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchProducts(selectedCategory)}
          >
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Discover fresh products</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products, farmers, regions..."
                placeholderTextColor={Colors.textLight}
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Enhanced Category Section */}
      <View style={styles.categorySection}>
        <Text style={styles.categorySectionTitle}>Fresh Product</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryPill,
                selectedCategory === category.id && [
                  styles.activeCategoryPill,
                  { backgroundColor: category.color || Colors.primary }
                ]
              ]}
              onPress={() => handleCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryPillContent}>
                <Ionicons 
                  name={category.icon || 'grid-outline'} 
                  size={18} 
                  color={selectedCategory === category.id ? '#fff' : (category.color || Colors.primary)} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.activeCategoryText
                ]}>
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={[
          styles.productsList,
          filteredProducts.length === 0 && styles.emptyList
        ]}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={6}
        windowSize={10}
        removeClippedSubviews={true}
      />

      {/* Enhanced Floating Cart Icon */}
      <TouchableOpacity 
        style={styles.cartIcon} 
        onPress={() => setIsCartVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.cartIconGradient}>
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
            <View style={styles.modalHeaderLeft}>
              <View style={styles.cartIconSmall}>
                <Ionicons name="bag-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Igikoni cyawe</Text>
            </View>
            <View style={styles.modalHeaderRight}>
              {cartItems.length > 0 && (
                <TouchableOpacity 
                  onPress={() => {
                    Alert.alert(
                      'Clear Cart',
                      'Are you sure you want to clear all items from your cart?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear', style: 'destructive', onPress: clearCart }
                      ]
                    );
                  }}
                  style={styles.clearCartButton}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={() => setIsCartVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {cartLoading ? (
            <View style={styles.cartLoadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.cartLoadingText}>Gutegura igikoni...</Text>
            </View>
          ) : cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <View style={styles.emptyCartIcon}>
                <Ionicons name="bag-outline" size={80} color={Colors.primaryLight} />
              </View>
              <Text style={styles.emptyCartTitle}>Igikoni cyawe ntico ufiteho</Text>
              <Text style={styles.emptyCartSubtitle}>Ongeraho ibicuruzwa ugere bigure</Text>
              <TouchableOpacity 
                style={styles.shopNowBtn} 
                onPress={() => setIsCartVisible(false)}
              >
                <Ionicons name="storefront-outline" size={20} color="#fff" />
                <Text style={styles.shopNowBtnText}>Komeza ugure</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <CartItem item={item} />}
                style={styles.cartScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cartListContent}
              />

              <View style={styles.cartSummary}>
                <View style={styles.cartSummaryHeader}>
                  <Text style={styles.cartSummaryTitle}>Icyegeranyo</Text>
                </View>
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Igiciro ({cartItemCount} ibintu)</Text>
                  <Text style={styles.totalAmount}>RWF {cartTotal.toLocaleString('en-US')}</Text>
                </View>
                
                <View style={styles.deliveryRow}>
                  <Text style={styles.deliveryLabel}>Uburyo bwo kohereza</Text>
                  <Text style={styles.deliveryAmount}>Ubusa</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>Byose hamwe</Text>
                  <Text style={styles.grandTotalAmount}>RWF {cartTotal.toLocaleString('en-US')}</Text>
                </View>
                
                <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                  <Ionicons name="card-outline" size={20} color="#fff" />
                  <Text style={styles.checkoutBtnText}>Komeza urishyure</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIconContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  loadingSpinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    backgroundColor: Colors.surface,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerGreeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  profileButton: {
    padding: 4,
  },

  // Search
  searchContainer: {
    marginBottom: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 0,
  },

  // Categories
  categorySection: {
    backgroundColor: Colors.surface,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categorySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 4,
  },
  activeCategoryPill: {
    borderColor: 'transparent',
  },
  categoryPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Products List
  productsList: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  productRow: {
    justifyContent: 'space-between',
    gap: 12,
  },

  // Product Card
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    flex: 1,
    maxWidth: (width - 44) / 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flashDealCard: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  flashDealBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flashDealText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashDealAddButton: {
    backgroundColor: Colors.accent,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
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
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  farmerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  farmerText: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: '500',
    flex: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  clearSearchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Cart Icon
  cartIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  cartIconGradient: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartIconSmall: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearCartButton: {
    padding: 8,
  },
  modalCloseButton: {
    padding: 4,
  },

  // Cart Loading
  cartLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  cartLoadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },

  // Empty Cart
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartIcon: {
    marginBottom: 24,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopNowBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Cart Items
  cartScrollView: {
    flex: 1,
  },
  cartListContent: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  cartItemPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  cartItemViewButton: {
    padding: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  cartItemLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  cartItemRegion: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
  quantityButtonLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  quantityButtonRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    textAlign: 'center',
    minWidth: 40,
  },

  // Cart Summary
  cartSummary: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cartSummaryHeader: {
    marginBottom: 16,
  },
  cartSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deliveryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  deliveryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BuyerDashboard;