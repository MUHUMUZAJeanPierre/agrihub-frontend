import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  StatusBar,
  Animated
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../contexts/CartContext';
import { Button } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';

const API_CONFIG = {
  PRODUCT_BASE_URL: 'https://agrihub-backend-4z99.onrender.com/product',
  CART_BASE_URL: 'https://agrihub-backend-4z99.onrender.com/cart',
  ORDER_URL: 'https://agrihub-backend-4z99.onrender.com/api/orders/place-order',
  TIMEOUT: 10000,
};

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

  cardBackground: '#666666',
  inputBackground: '#F5F5F5',
  borderColor: '#E0E0E0',

  gradient: ['#4A90E2', '#357ABD'],
  orangeGradient: ['#FF6B35', '#FF8A50'],
};


const LightColors = {
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

const DarkColors = {
  primary: '#4A90E2',
  primaryDark: '#2D5AA0',
  secondary: '#FF6B35',
  accent: '#FFA726',

  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2C2C2C',

  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  cardBackground: '#1A1A1A',
  inputBackground: '#2C2C2C',
  borderColor: '#3A3A3A',

  gradient: ['#4A90E2', '#357ABD'],
  orangeGradient: ['#FF6B35', '#FF8A50'],
};


const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline', color: Colors.primary },
  { id: 'fruits', name: 'Fruits', icon: 'nutrition-outline', color: Colors.accent },
  { id: 'dairy', name: 'Dairy', icon: 'water-outline', color: Colors.primary },
  { id: 'vegetables', name: 'Veggies', icon: 'leaf-outline', color: Colors.success },
  { id: 'meat', name: 'Meat', icon: 'restaurant-outline', color: Colors.error },
  { id: 'tubers', name: 'Tubers', icon: 'flower-outline', color: Colors.warning },
];

const BuyerDashboard = ({ navigation }) => {
  const { language, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme, fontFamily } = useTheme();
  const Colors = theme === 'dark' ? DarkColors : LightColors;
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const [username, setUsername] = useState('');
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUsername(parsed.name || 'User');
          console.log(parsed, parse.name)
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserName();
  }, []);
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const promoScrollRef = useRef(null);

  // Spinner animation hooks (must be at top level)
  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });


  const promotions = [
    {
      discount: '35% OFF',
      text: 'On your first order from the app and get discount',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
    },
    {
      discount: '20% OFF',
      text: 'Fresh veggies this week only! above RWF 10,000',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
    },
    {
      discount: 'Free Delivery',
      text: 'Enjoy free delivery on orders above RWF 10,000',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
    },
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentSlide + 1) % promotions.length;
      setCurrentSlide(nextIndex);
      promoScrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 4000); 

    return () => clearInterval(interval);
  }, [currentSlide]);

  const handlePlaceOrder = async () => {
    try {
      if (!authToken) {
        Alert.alert(t('authRequired'), t('loginToOrder'));
        return;
      }

      const response = await axios.post(API_CONFIG.ORDER_URL, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      Alert.alert(t('orderPlaced'), t('orderSuccess'));
      clearCart();
      setIsCartVisible(false);

      console.log('Order response:', response.data);
    } catch (error) {
      console.error('❌ Failed to place order:', error);
      Alert.alert(t('orderFailed'), t('orderFailedMsg'));
    }
  };


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

      // console.log('✅ Products fetched successfully:', response.data?.length || 0);

      const transformedProducts = response.data.map(product => ({
        ...product,
        price: product.current_price,
        pricePerKg: 'kg', 
        isPopular: product.category === 'fruits', 
      }));

      setProducts(transformedProducts);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to load products');

      Alert.alert(
        t('errorLoadingProducts'),
        t('unableToLoadProducts'),
        [
          { text: t('retry'), onPress: fetchProducts },
          { text: t('cancel'), style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

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

  const popularFruits = useMemo(() => {
    return products
      .filter(product => product.category === 'fruits')
      .slice(0, 6);
  }, [products]);

  const getProductsByCategory = useCallback((category) => {
    if (category === 'all') return products;
    return products.filter(product =>
      product.category?.toLowerCase() === category.toLowerCase()
    );
  }, [products]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.current_price?.replace(/[^\d.]/g, '') || item.price?.replace(/[^\d.]/g, '') || '0');
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing app...');
      await getAuthToken();
      await fetchProducts();
    };

    initializeApp();
  }, [getAuthToken, fetchProducts]);

  const handleAddToCart = useCallback(async (product) => {
    try {
      const token = authToken || await getAuthToken();
      if (!token) {
        Alert.alert(
          t('loginRequired'),
          t('loginToAddCart'),
          [
            { text: t('cancel'), style: 'cancel' },
            { text: t('login'), onPress: () => navigation.navigate('login') },
            { text: t('register'), onPress: () => navigation.navigate('register') },
          ]
        );
        return;
      }
      setAddingToCart(product._id);
      // Use CartContext addToCart
      addToCart(product);
      Alert.alert(
        t('addedToCart'),
        t('addedToCartMsg', { product: product.title }),
        [
          { text: t('continueShopping'), style: 'cancel' },
          {
            text: t('viewCart'),
            onPress: () => setIsCartVisible(true)
          }
        ]
      );
    } catch (err) {
      console.error('❌ Add to cart error:', err);
      Alert.alert(t('error'), t('addToCartFailed'));
    } finally {
      setAddingToCart(null);
    }
  }, [addToCart, authToken, getAuthToken, navigation]);

  // Remove item from cart
  const handleRemoveFromCart = useCallback((productId) => {
    Alert.alert(
      t('removeItem'),
      t('removeItemConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('remove'),
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
      // style={styles.productCard}
      // style={[styles.productCard, { backgroundColor: Colors.cardB ackground, borderColor: Colors.borderColor }]}
      style={[styles.productCard, { backgroundColor: Colors.cardBackground, borderColor: theme === 'dark' ? '#333' : '#E0E0E0',
}]}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ProductDetailScreen', {
          product: item,
          allProducts: products,
        })
      }
    >
      <View 
        style={[styles.imageContainer, { backgroundColor: Colors.surface }]}
      >
        {item.img ? (
          <Image
            source={{ uri: item.img }}
            style={styles.productImage}
          />
        ) : (
          <View 
            style={[styles.placeholderImage, { backgroundColor: Colors.surfaceLight }]}
            // style={styles.placeholderImage}
          >
            // <Ionicons name="image-outline" size={48} color={Colors.textTertiary} />
          </View>
        )}

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
            <Ionicons name="add" size={14} color="#4CAF50" />
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
        <View>
          
        </View>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.priceContainer}>
          <Text 
          style={[styles.productTitle, { color: Colors.textPrimary }]}
          >
            {item.current_price || item.price}
            {item.pricePerKg && <Text 
            style={[styles.priceUnit, { color: Colors.textSecondary }]}
            >/{item.pricePerKg}</Text>}
          </Text>
          {item.past_price && (
            <Text 
            style={[styles.oldPrice, { color: Colors.textSecondary }]}
            >{item.past_price}</Text>
          )}
        </View>
        {item.region && (
          <Text 
          style={[styles.productRegion, { color: Colors.textSecondary }]}
          numberOfLines={1}>
            📍 {item.region}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  ));

  const CategoryCard = React.memo(({ item }) => (
    <TouchableOpacity
      // style={[
      //   styles.categoryCard,
      //   selectedCategory === item.id && styles.selectedCategoryCard
      // ]}
        style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategoryCard
      ]}
      onPress={() => handleCategorySelect(item.id)}
      activeOpacity={0.8}
    >
      <View 
      style={[
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

  const CartItemCard = React.memo(({ item }) => (
    <View 
    style={[styles.cartItem, { backgroundColor: Colors.cardBackground }]}
    >
      <Image source={{ uri: item.img }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text 
        style={[styles.cartItemTitle, { color: Colors.textPrimary }]}
        >{item.title}</Text>
        <Text style={styles.cartItemPrice}>{item.current_price || item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: Colors.surface }]}
            onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text 
          style={[styles.quantityText, { color: Colors.textPrimary }]}
          >{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: Colors.surface }]}
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

  const renderLoadingSpinner = (styles, Colors, isLoading) => (
    <View style={styles.loadingContainer}>
      <View style={styles.spinnerContainer}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}> 
          <View style={styles.spinnerOuter}>
            <View style={styles.spinnerInner} />
          </View>
        </Animated.View>
        <Text style={styles.loadingText}>
          {isLoading ? t('loadingProducts') : t('searching')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return renderLoadingSpinner(styles, Colors, loading);
  }

  if (error && products.length === 0) {
    return (
      <View 
      style={[styles.errorContainer, { backgroundColor: Colors.background }]}
      >
        <Ionicons name="alert-circle-outline" size={80} color={Colors.error} />
        <Text 
        style={[styles.errorTitle, { color: Colors.textPrimary }]}
        >Oops! Something went wrong</Text>
        <Text 
        style={[styles.errorText, { color: Colors.textSecondary }]}
        >{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView 
    style={[styles.container, { backgroundColor: Colors.background }]}
    >
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme === 'dark' ? '#121212' : '#4CAF50'} />
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
        <HeaderComponent
          username={username}
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          changeLanguage={changeLanguage}
          Colors={Colors}
          t={t}
          styles={styles}
          navigation={navigation}
        />
        <View style={styles.searchContainer}>
          <View 
          style={[styles.searchInputContainer, { backgroundColor: Colors.inputBackground }]}
          >
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: Colors.textPrimary }]}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: Colors.inputBackground }]}
          >
            <Ionicons name="options-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Promotion Banner */}
        <View style={styles.promotionSection}>
          <ScrollView
            ref={promoScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentSlide(index);
            }}
            scrollEventThrottle={16}
            style={styles.promotionScrollView}
          >
            {promotions.map((promo, index) => (
              <View key={index} style={[styles.promotionBanner, { width }]}>
                <View 
                // style={styles.promotionCard}
                style={[styles.promotionCard, { 
                  backgroundColor: theme === 'dark' ? '#1E3A1E' : '#F1F8E9',
                  borderColor: theme === 'dark' ? '#2E5A2E' : '#E8F5E8'
                }]}
                >
                  <View style={styles.promotionContent}>
                    <View style={styles.promotionBadge}>
                      <Text style={styles.promotionDiscount}>{promo.discount}</Text>
                    </View>
                    <Text 
                    // style={styles.promotionText}
                    style={[styles.promotionText, { color: theme === 'dark' ? '#A5D6A7' : '#2E7D31' }]}
                    >{promo.text}</Text>
                    <TouchableOpacity
                      style={styles.orderNowButton}
                      onPress={() => {
                        handlePlaceOrder();
                        console.log(`Clicked promo: ${promo.discount}`);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.orderNowText}>Order Now</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.promotionImageContainer}>
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: promo.image }}
                        style={styles.promotionImage}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.indicatorContainer}>
            {promotions.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  index === currentSlide
                    ? {
                        backgroundColor: Colors.primary,
                        width: 24,
                        borderColor: Colors.primary,
                        shadowColor: Colors.primary,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.15,
                        shadowRadius: 2,
                        elevation: 2,
                      }
                    : { width: 8 },
                ]}
                onPress={() => {
                  setCurrentSlide(index);
                  promoScrollRef.current?.scrollTo({ x: index * width, animated: true });
                }}
                activeOpacity={0.7}
              />
            ))}
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
        {selectedCategory === 'all' && !searchQuery ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text 
              style={[styles.sectionTitle, { color: Colors.textPrimary }]}
              >{t('popularFruits')}</Text>
              <TouchableOpacity onPress={() => handleCategorySelect('fruits')}>
                <Text style={styles.seeAllText}>{t('seeAll')}</Text>
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
            <View 
            style={[styles.sectionTitle, { color: Colors.textPrimary }]}
            >
              <Text style={styles.sectionTitle}>
                {searchQuery ? t('searchResults', { count: filteredProducts.length }) :
                  selectedCategory === 'all' ? t('allProducts') :
                    categories.find(c => c.id === selectedCategory)?.name || t('products')}
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
                <Text 
                   style={[styles.emptyResultsTitle, { color: Colors.textPrimary }]}
                >{t('noProductsFound')}</Text>
                <Text 
                style={[styles.emptyResultsText, { color: Colors.textSecondary }]}
                >
                  {searchQuery ?
                    t('noResultsFor', { query: searchQuery }) :
                    t('noProductsInCategory', { category: categories.find(c => c.id === selectedCategory)?.name || t('thisCategory') })
                  }
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedCategory === 'all' && !searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text 
               style={[styles.sectionTitle, { color: Colors.textPrimary }]}
              // style={styles.sectionTitle}
              >{t('allProducts')}</Text>
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

      <Modal visible={isCartVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView 
        style={[styles.modalContainer, { backgroundColor: Colors.cardBackground }]}
        >
          <View style={styles.modalHeader}>
            <Text 
            style={[styles.modalTitle, { color: Colors.textPrimary }]}
            >{t('shoppingCart', { count: cartItemCount })}</Text>
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
              <Text 
              style={[styles.emptyCartTitle, { color: Colors.textPrimary }]}
              >{t('cartEmpty')}</Text>
              <Text 
               style={[styles.emptyCartText, { color: Colors.textSecondary }]}
              >{t('addItemsToGetStarted')}</Text>
              <TouchableOpacity
                style={styles.shopNowBtn}
                onPress={() => setIsCartVisible(false)}
              >
                <Text style={styles.shopNowBtnText}>{t('continueShopping')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cartContent}>
              <ScrollView style={styles.cartItems}>
                {cartItems.map((item) => (
                  <CartItemCard key={item._id} item={item} />
                ))}
              </ScrollView>

              <View 
               style={[styles.cartFooter, { backgroundColor: Colors.cardBackground, borderTopColor: Colors.borderColor }]}
              >
                <View style={styles.cartSummary}>
                  <View style={styles.cartTotal}>
                    <Text 
                     style={[styles.totalLabel, { color: Colors.textSecondary }]}
                    >{t('totalItems', { count: cartItemCount })}</Text>
                    <Text 
                    style={[styles.totalAmount, { color: Colors.textPrimary }]}
                    >{t('rwfAmount', { amount: cartTotal.toLocaleString() })}</Text>
                  </View>
                  <TouchableOpacity
                      style={[styles.clearCartButton, { backgroundColor: Colors.error }]}
                    onPress={() => {
                      Alert.alert(
                        t('clearCart'),
                        t('clearCartConfirm'),
                        [
                          { text: t('cancel'), style: 'cancel' },
                          {
                            text: t('clear'),
                            style: 'destructive',
                            onPress: clearCart
                          }
                        ]
                      );
                    }}
                  >
                    <Text 
                     style={[styles.clearCartText, { color: Colors.textPrimary }]}
                    >{t('clearCart')}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.checkoutBtn}>
                  <Text 
                  style={styles.checkoutBtnText}
                  >{t('orderNow')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};


const HeaderComponent = ({ username, theme, toggleTheme, language, changeLanguage, Colors, t, styles, navigation }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  return (
    <View style={[styles.header, { backgroundColor: Colors.background, paddingTop: 20, paddingBottom: 4 }]}> 
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.headerName, { color: Colors.textPrimary }]}>
            {username ? username : t('dashboardTitle')}
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => setShowProfileModal(true)}>
          <View style={[styles.profileIcon, { backgroundColor: Colors.surface }]}> 
            <Ionicons name="person-circle-outline" size={28} color={Colors.textPrimary} />
          </View>
        </TouchableOpacity>
        <Modal
          visible={showProfileModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowProfileModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalOverlay, { backgroundColor: Colors.overlay || 'rgba(0,0,0,0.6)' }]}
            onPressOut={() => setShowProfileModal(false)}
          >
            <View style={[styles.profileModalContent, { backgroundColor: Colors.cardBackground, borderColor: Colors.borderColor || Colors.border }]}> 
              <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>{t('profileOptions')}</Text>
              <TouchableOpacity
                style={[styles.toggleButton, { backgroundColor: Colors.surface, borderColor: Colors.borderColor || Colors.border }]}
                onPress={toggleTheme}
              >
                <View style={styles.toggleButtonContent}>
                  <Ionicons 
                    name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} 
                    size={24} 
                    color={Colors.textPrimary} 
                  />
                  <Text style={[styles.toggleButtonText, { color: Colors.textPrimary }]}> {theme === 'light' ? t('switchToDark') : t('switchToLight')} </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, { backgroundColor: Colors.surface, borderColor: Colors.borderColor || Colors.border }]}
                onPress={() => changeLanguage(language === 'en' ? 'rw' : 'en')}
              >
                <View style={styles.toggleButtonContent}>
                  <Ionicons name="language-outline" size={24} color={Colors.textPrimary} />
                  <Text style={[styles.toggleButtonText, { color: Colors.textPrimary }]}> {language === 'en' ? t('changeToKinyarwanda') : t('changeToEnglish')} </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: Colors.primary }]}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.closeButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
};

const createStyles = (Colors) => StyleSheet.create({
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
    fontFamily: 'Poppins_400Regular', 
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
    fontFamily: 'Poppins_400Regular',
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  retryButton: {
    backgroundColor: '#2E7D31',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
  },

  header: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 4, 
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, 
  },
  headerGreeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'Poppins_400Regular',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Poppins_400Regular',
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
    paddingHorizontal: 20,
    marginBottom: 12, // Add space below search bar
    marginTop: 0, // Ensure no extra space above
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
    fontFamily: 'Poppins_400Regular',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 0,
    fontFamily: 'Poppins_400Regular', 
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
  },

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
    fontFamily: 'Poppins_400Regular',
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  orderNowText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.secondary,
    fontFamily: 'Poppins_400Regular', 
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
    fontFamily: 'Poppins_400Regular', 
  },
  seeAllText: {
    fontSize: 14,
    color:'#2E7D31',
    fontWeight: '500',
    fontFamily: 'Poppins_400Regular', 
  },


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
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily: 'Poppins_400Regular', 
  },
  selectedCategoryName: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular', 
  },

  // Products
  productsContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  productCard: {
  width: 200,
  backgroundColor: Colors.cardBackground,
  borderRadius: 10,
  marginRight: 16,
  borderWidth: 1,
  borderColor: '#F0F0F0',
  

  },
  imageContainer: {
    position: 'relative',
    height: 100,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: 'hidden',
  },
 
  productImage: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
  borderRadius: 10,
},

placeholderImage: {
  width: '100%',
  height: '100%',
  backgroundColor: Colors.surfaceLight,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 10,
},

imageContainer: {
  position: 'relative',
  height: 130,
  borderRadius: 10,
  overflow: 'hidden',
  backgroundColor: Colors.surface,
  elevation: 3, // Android shadow
  shadowColor: '#000', // iOS shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},

discountBadge: {
  position: 'absolute',
  top: 8,
  left: 8,
  backgroundColor: Colors.error,
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
  zIndex: 1,
},

discountText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: '600',
  fontFamily: 'Poppins_400Regular'
},

addButton: {
  position: 'absolute',
  bottom: 8,
  right: 8,
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 6,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},

favoriteButton: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 6,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
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
    backgroundColor: '#dcfce7',
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
    fontFamily: 'Poppins_400Regular',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
    fontFamily: 'Poppins_400Regular',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 50,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D31',
  },
  priceUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  oldPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    fontFamily: 'Poppins_400Regular',
  },
  productRegion: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
  },

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
    fontFamily: 'Poppins_400Regular',
  },
  emptyResultsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },

  // Floating Cart
  cartIcon: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  cartIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#2E7D31',
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
    top: -5,
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
    fontFamily: 'Poppins_400Regular',
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
    fontFamily: 'Poppins_400Regular',
  },
  emptyCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Poppins_400Regular',
  },
  emptyCartSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  shopNowBtn: {
    backgroundColor: '#2E7D31',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  shopNowBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins_400Regular',
  },

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
    fontFamily: 'Poppins_400Regular',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D31',
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular', 
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
    fontFamily: 'Poppins_400Regular'
  },
  cartTotalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'Poppins_400Regular', 
  },
  cartTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Poppins_400Regular',
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
    backgroundColor: '#2E7D31',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  promotionSection: {
    marginBottom: 5,
  },

  promotionScrollView: {
    marginBottom: 10,
  },

  promotionBanner: {
    paddingHorizontal: 20,
  },

  promotionCard: {
    backgroundColor: '#F1F8E9',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',   
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8F5E8'
  },

  promotionContent: {
    flex: 1,
    zIndex: 2,
  },

  promotionBadge: {
    backgroundColor: '#2E7D31',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  promotionDiscount: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: 0.5,
    fontFamily: 'Poppins_400Regular',
  },

  promotionText: {
    fontSize: 15,
    color: '#2E7D31',
    opacity: 0.95,
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'Poppins_400Regular',
  },

  orderNowButton: {
    backgroundColor: '#2E7D31',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    
  },

  orderNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins_400Regular',
  },

  promotionImageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
 
  },

  promotionImage: {
    width: '100%',
    height: '100%',
  },

  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
    backgroundColor: '#E0E0E0', // subtle gray for inactive
    borderWidth: 1,
    borderColor: '#D1D5DB', // light border for visibility
    marginHorizontal: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModalContent: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  toggleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins_400Regular',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins_400Regular',
  },
  // Loading spinner styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    marginBottom: 16,
  },
  spinnerOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: Colors.borderColor,
    borderTopColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    opacity: 0.6,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    fontFamily: 'Poppins_400Regular',
  },
});

export default BuyerDashboard;
