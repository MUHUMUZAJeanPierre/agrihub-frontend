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
  StatusBar
} from 'react-native';
// import {styles, Colors} from '../styles/BuyerDashboardStyles'
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../contexts/CartContext';
import { Button } from 'react-native-paper';

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

  cardBackground: '#FFFFFF',
  inputBackground: '#F5F5F5',
  borderColor: '#E0E0E0',

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
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, [currentSlide]);

  const handlePlaceOrder = async () => {
    try {
      if (!authToken) {
        Alert.alert('Authentication Required', 'Please log in to place your order.');
        return;
      }

      const response = await axios.post(API_CONFIG.ORDER_URL, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      Alert.alert('✅ Order Placed', 'Your order has been successfully submitted.');
      clearCart();
      setIsCartVisible(false);

      console.log('🧾 Order response:', response.data);
    } catch (error) {
      console.error('❌ Failed to place order:', error);
      Alert.alert('Order Failed', 'Could not place order. Please try again.');
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

      console.log('✅ Products fetched successfully:', response.data?.length || 0);

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
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={48} color={Colors.textTertiary} />
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
            <Ionicons name="add" size={14} color="#10b981" />
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
          <Text style={styles.productPrice}>
            {item.current_price || item.price}
            {item.pricePerKg && <Text style={styles.priceUnit}>/{item.pricePerKg}</Text>}
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
        <ActivityIndicator size="large" color={"#2E7D31"} />
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
      <StatusBar barStyle="dark-content" backgroundColor="#4CAF50" />
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
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerName}>Aminur tahmid</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileIcon}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

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
                <View style={styles.promotionCard}>
                  <View style={styles.promotionContent}>
                    <View style={styles.promotionBadge}>
                      <Text style={styles.promotionDiscount}>{promo.discount}</Text>
                    </View>
                    <Text style={styles.promotionText}>{promo.text}</Text>
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
                  {
                    backgroundColor: index === currentSlide ? '#2E7D31' : 'rgba(255, 255, 255, 0.4)',
                    width: index === currentSlide ? 24 : 8,
                  }
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
                  <Text style={styles.checkoutBtnText}>Order Now</Text>
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
    color:'#2E7D31',
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
  // productImage: {
  //   width: '100%',
  //   height: '100%',
  //   resizeMode: 'cover',
  // },
  // placeholderImage: {
  //   width: '100%',
  //   height: '100%',
  //   backgroundColor: Colors.surfaceLight,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
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
  fontWeight: 'bold',
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
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
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
  },
  productRegion: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    color: '#2E7D31',
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
  },

  promotionText: {
    fontSize: 15,
    color: '#2E7D31',
    opacity: 0.95,
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '500',
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
  },
});

export default BuyerDashboard;
























// import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   Modal,
//   Alert,
//   StyleSheet,
//   Dimensions,
//   ScrollView,
//   TextInput,
//   RefreshControl,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar
// } from 'react-native';
// import axios from 'axios';
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useCart } from '../contexts/CartContext';
// import { useTheme } from '../contexts/ThemeContext';
// import { Button } from 'react-native-paper';

// const API_CONFIG = {
//   PRODUCT_BASE_URL: 'https://agrihub-backend-4z99.onrender.com/product',
//   CART_BASE_URL: 'https://agrihub-backend-4z99.onrender.com/cart',
//   ORDER_URL: 'https://agrihub-backend-4z99.onrender.com/api/orders/place-order',
//   TIMEOUT: 10000,
// };

// const AUTH_KEYS = {
//   TOKEN: '@auth_token',
//   USER_ID: '@user_id',
//   USER_DATA: '@user_data',
// };

// const LightColors = {
//   primary: '#4A90E2',
//   primaryDark: '#2D5AA0',
//   secondary: '#FF6B35',
//   accent: '#FFA726',

//   background: '#FFFFFF',
//   surface: '#F8F9FA',
//   surfaceLight: '#F0F0F0',

//   textPrimary: '#000000',
//   textSecondary: '#666666',
//   textTertiary: '#999999',

//   success: '#4CAF50',
//   warning: '#FF9800',
//   error: '#F44336',

//   cardBackground: '#FFFFFF',
//   inputBackground: '#F5F5F5',
//   borderColor: '#E0E0E0',

//   gradient: ['#4A90E2', '#357ABD'],
//   orangeGradient: ['#FF6B35', '#FF8A50'],
// };

// const DarkColors = {
//   primary: '#4A90E2',
//   primaryDark: '#2D5AA0',
//   secondary: '#FF6B35',
//   accent: '#FFA726',

//   background: '#121212',
//   surface: '#1E1E1E',
//   surfaceLight: '#2C2C2C',

//   textPrimary: '#FFFFFF',
//   textSecondary: '#B0B0B0',
//   textTertiary: '#808080',

//   success: '#4CAF50',
//   warning: '#FF9800',
//   error: '#F44336',

//   cardBackground: '#1E1E1E',
//   inputBackground: '#2C2C2C',
//   borderColor: '#3A3A3A',

//   gradient: ['#4A90E2', '#357ABD'],
//   orangeGradient: ['#FF6B35', '#FF8A50'],
// };

// const CATEGORIES = [
//   { id: 'all', name: 'All', icon: 'grid-outline', color: '#4A90E2' },
//   { id: 'fruits', name: 'Fruits', icon: 'nutrition-outline', color: '#FFA726' },
//   { id: 'dairy', name: 'Dairy', icon: 'water-outline', color: '#4A90E2' },
//   { id: 'vegetables', name: 'Veggies', icon: 'leaf-outline', color: '#4CAF50' },
//   { id: 'meat', name: 'Meat', icon: 'restaurant-outline', color: '#F44336' },
//   { id: 'tubers', name: 'Tubers', icon: 'flower-outline', color: '#FF9800' },
// ];

// const BuyerDashboard = ({ navigation }) => {
//   const { theme } = useTheme();
//   const Colors = theme === 'dark' ? DarkColors : LightColors;
  
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState(CATEGORIES);
//   const [favorites, setFavorites] = useState([]);
//   const [isCartVisible, setIsCartVisible] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [cartLoading, setCartLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [addingToCart, setAddingToCart] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [error, setError] = useState(null);
//   const [authToken, setAuthToken] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const { width, height } = Dimensions.get('window');
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const promoScrollRef = useRef(null);

//   const promotions = [
//     {
//       discount: '35% OFF',
//       text: 'On your first order from the app and get discount',
//       image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
//     },
//     {
//       discount: '20% OFF',
//       text: 'Fresh veggies this week only! above RWF 10,000',
//       image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
//     },
//     {
//       discount: 'Free Delivery',
//       text: 'Enjoy free delivery on orders above RWF 10,000',
//       image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
//     },
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const nextIndex = (currentSlide + 1) % promotions.length;
//       setCurrentSlide(nextIndex);
//       promoScrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
//     }, 4000);

//     return () => clearInterval(interval);
//   }, [currentSlide]);

//   const handlePlaceOrder = async () => {
//     try {
//       if (!authToken) {
//         Alert.alert('Authentication Required', 'Please log in to place your order.');
//         return;
//       }

//       const response = await axios.post(API_CONFIG.ORDER_URL, {}, {
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       });

//       Alert.alert('✅ Order Placed', 'Your order has been successfully submitted.');
//       clearCart();
//       setIsCartVisible(false);

//       console.log('🧾 Order response:', response.data);
//     } catch (error) {
//       console.error('❌ Failed to place order:', error);
//       Alert.alert('Order Failed', 'Could not place order. Please try again.');
//     }
//   };

//   const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

//   const getAuthToken = useCallback(async () => {
//     try {
//       const token = await AsyncStorage.getItem(AUTH_KEYS.TOKEN);
//       const storedUserId = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);

//       console.log('🔑 Retrieved token:', token ? 'Token exists' : 'No token');
//       console.log('👤 Retrieved userId:', storedUserId);

//       setAuthToken(token);
//       setUserId(storedUserId);
//       return token;
//     } catch (error) {
//       console.error('❌ Error getting auth token:', error);
//       return null;
//     }
//   }, []);

//   const handleAuthError = useCallback(() => {
//     Alert.alert(
//       'Session Expired',
//       'Your session has expired. Please log in again.',
//       [
//         {
//           text: 'OK',
//           onPress: () => {
//             AsyncStorage.multiRemove([AUTH_KEYS.TOKEN, AUTH_KEYS.USER_ID, AUTH_KEYS.USER_DATA]);
//             navigation.navigate('Login');
//           }
//         }
//       ]
//     );
//   }, [navigation]);

//   const createAuthenticatedClient = useCallback((baseURL) => {
//     return axios.create({
//       baseURL,
//       timeout: API_CONFIG.TIMEOUT,
//       headers: {
//         'Content-Type': 'application/json',
//       }
//     });
//   }, []);

//   const productApiClient = useMemo(() => createAuthenticatedClient(API_CONFIG.PRODUCT_BASE_URL), [createAuthenticatedClient]);
//   const cartApiClient = useMemo(() => createAuthenticatedClient(API_CONFIG.CART_BASE_URL), [createAuthenticatedClient]);

//   useEffect(() => {
//     const addAuthInterceptor = (client) => {
//       client.interceptors.request.use(
//         async (config) => {
//           const token = authToken || await getAuthToken();
//           if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//           }

//           if (userId) {
//             config.headers['x-user-id'] = userId;
//           }

//           console.log('🔄 Request URL:', config.url);
//           console.log('🔑 Auth header:', config.headers.Authorization ? 'Present' : 'Missing');

//           return config;
//         },
//         (error) => {
//           console.error('❌ Request interceptor error:', error);
//           return Promise.reject(error);
//         }
//       );

//       client.interceptors.response.use(
//         (response) => response,
//         (error) => {
//           if (error.response?.status === 401) {
//             console.error('❌ 401 Unauthorized - clearing auth data');
//             handleAuthError();
//           }
//           return Promise.reject(error);
//         }
//       );
//     };

//     if (authToken) {
//       addAuthInterceptor(productApiClient);
//       addAuthInterceptor(cartApiClient);
//     }
//   }, [authToken, userId, productApiClient, cartApiClient, getAuthToken, handleAuthError]);

//   const fetchProducts = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       console.log('🔄 Fetching products from API...');
//       const response = await axios.get(API_CONFIG.PRODUCT_BASE_URL, {
//         timeout: API_CONFIG.TIMEOUT,
//       });

//       console.log('✅ Products fetched successfully:', response.data?.length || 0);

//       const transformedProducts = response.data.map(product => ({
//         ...product,
//         price: product.current_price,
//         pricePerKg: 'kg', 
//         isPopular: product.category === 'fruits', 
//       }));

//       setProducts(transformedProducts);
//     } catch (err) {
//       console.error('❌ Error fetching products:', err);
//       setError(err.message || 'Failed to load products');

//       Alert.alert(
//         'Error Loading Products',
//         'Unable to load products. Please check your connection and try again.',
//         [
//           { text: 'Retry', onPress: fetchProducts },
//           { text: 'Cancel', style: 'cancel' }
//         ]
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const filteredProducts = useMemo(() => {
//     let filtered = products;

//     if (selectedCategory && selectedCategory !== 'all') {
//       filtered = filtered.filter(product =>
//         product.category?.toLowerCase() === selectedCategory.toLowerCase()
//       );
//     }

//     if (searchQuery.trim()) {
//       filtered = filtered.filter(product =>
//         product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         product.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         product.description?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     return filtered;
//   }, [products, selectedCategory, searchQuery]);

//   const popularFruits = useMemo(() => {
//     return products
//       .filter(product => product.category === 'fruits')
//       .slice(0, 6);
//   }, [products]);

//   const getProductsByCategory = useCallback((category) => {
//     if (category === 'all') return products;
//     return products.filter(product =>
//       product.category?.toLowerCase() === category.toLowerCase()
//     );
//   }, [products]);

//   const cartTotal = useMemo(() => {
//     return cartItems.reduce((total, item) => {
//       const price = parseFloat(item.current_price?.replace(/[^\d.]/g, '') || item.price?.replace(/[^\d.]/g, '') || '0');
//       return total + (price * item.quantity);
//     }, 0);
//   }, [cartItems]);

//   const cartItemCount = useMemo(() => {
//     return cartItems.reduce((total, item) => total + item.quantity, 0);
//   }, [cartItems]);

//   useEffect(() => {
//     const initializeApp = async () => {
//       console.log('🚀 Initializing app...');
//       await getAuthToken();
//       await fetchProducts();
//     };

//     initializeApp();
//   }, [getAuthToken, fetchProducts]);

//   const handleAddToCart = useCallback(async (product) => {
//     try {
//       setAddingToCart(product._id);

//       addToCart(product);

//       Alert.alert(
//         '✅ Added to Cart',
//         `${product.title} has been added to your cart.`,
//         [
//           { text: 'Continue Shopping', style: 'cancel' },
//           {
//             text: 'View Cart',
//             onPress: () => setIsCartVisible(true)
//           }
//         ]
//       );
//     } catch (err) {
//       console.error('❌ Add to cart error:', err);
//       Alert.alert('Error', 'Failed to add item to cart. Please try again.');
//     } finally {
//       setAddingToCart(null);
//     }
//   }, [addToCart]);

//   const handleRemoveFromCart = useCallback((productId) => {
//     Alert.alert(
//       'Remove Item',
//       'Are you sure you want to remove this item from your cart?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Remove',
//           style: 'destructive',
//           onPress: () => removeFromCart(productId)
//         }
//       ]
//     );
//   }, [removeFromCart]);

//   const handleUpdateQuantity = useCallback((productId, newQuantity) => {
//     if (newQuantity <= 0) {
//       handleRemoveFromCart(productId);
//     } else {
//       updateQuantity(productId, newQuantity);
//     }
//   }, [updateQuantity, handleRemoveFromCart]);

//   const toggleFavorite = useCallback(async (productId) => {
//     try {
//       const isFavorite = favorites.includes(productId);

//       if (isFavorite) {
//         setFavorites(prev => prev.filter(id => id !== productId));
//       } else {
//         setFavorites(prev => [...prev, productId]);
//       }
//     } catch (err) {
//       console.error('❌ Toggle favorite error:', err);
//     }
//   }, [favorites]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       await fetchProducts();
//     } catch (error) {
//       console.error('❌ Refresh error:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [fetchProducts]);

//   const handleSearch = useCallback((query) => {
//     setSearchQuery(query);
//   }, []);

//   const handleCategorySelect = useCallback((categoryId) => {
//     setSelectedCategory(categoryId);
//   }, []);

//   const ProductCard = React.memo(({ item }) => (
//     <TouchableOpacity
//       style={[styles.productCard, { backgroundColor: Colors.cardBackground, borderColor: Colors.borderColor }]}
//       activeOpacity={0.8}
//       onPress={() =>
//         navigation.navigate('ProductDetailScreen', {
//           product: item,
//           allProducts: products,
//         })
//       }
//     >
//       <View style={[styles.imageContainer, { backgroundColor: Colors.surface }]}>
//         {item.img ? (
//           <Image
//             source={{ uri: item.img }}
//             style={styles.productImage}
//           />
//         ) : (
//           <View style={[styles.placeholderImage, { backgroundColor: Colors.surfaceLight }]}>
//             <Ionicons name="image-outline" size={48} color={Colors.textTertiary} />
//           </View>
//         )}

//         {item.past_price && item.current_price && (
//           <View style={styles.discountBadge}>
//             <Text style={styles.discountText}>
//               {Math.round(((parseFloat(item.past_price.replace(/[^\d.]/g, '')) -
//                 parseFloat(item.current_price.replace(/[^\d.]/g, ''))) /
//                 parseFloat(item.past_price.replace(/[^\d.]/g, ''))) * 100)}% OFF
//             </Text>
//           </View>
//         )}

//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={(e) => {
//             e.stopPropagation();
//             handleAddToCart(item);
//           }}
//           disabled={addingToCart === item._id}
//           activeOpacity={0.8}
//         >
//           {addingToCart === item._id ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Ionicons name="add" size={14} color="#10b981" />
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.favoriteButton}
//           onPress={(e) => {
//             e.stopPropagation();
//             toggleFavorite(item._id);
//           }}
//           activeOpacity={0.8}
//         >
//           <Ionicons
//             name={favorites.includes(item._id) ? "heart" : "heart-outline"}
//             size={16}
//             color={favorites.includes(item._id) ? Colors.error : Colors.textSecondary}
//           />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.productInfo}>
//         <Text style={[styles.productTitle, { color: Colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
//         <View style={styles.priceContainer}>
//           <Text style={styles.productPrice}>
//             {item.current_price || item.price}
//             {item.pricePerKg && <Text style={[styles.priceUnit, { color: Colors.textSecondary }]}>/{item.pricePerKg}</Text>}
//           </Text>
//           {item.past_price && (
//             <Text style={[styles.oldPrice, { color: Colors.textSecondary }]}>{item.past_price}</Text>
//           )}
//         </View>
//         {item.region && (
//           <Text style={[styles.productRegion, { color: Colors.textSecondary }]} numberOfLines={1}>
//             📍 {item.region}
//           </Text>
//         )}
//       </View>
//     </TouchableOpacity>
//   ));

//   const CategoryCard = React.memo(({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.categoryCard,
//         selectedCategory === item.id && styles.selectedCategoryCard
//       ]}
//       onPress={() => handleCategorySelect(item.id)}
//       activeOpacity={0.8}
//     >
//       <View style={[
//         styles.categoryIcon,
//         { backgroundColor: item.color + '20' },
//         selectedCategory === item.id && { backgroundColor: item.color }
//       ]}>
//         <Ionicons
//           name={item.icon}
//           size={24}
//           color={selectedCategory === item.id ? '#fff' : item.color}
//         />
//       </View>
//       <Text style={[
//         styles.categoryName,
//         { color: selectedCategory === item.id ? Colors.textPrimary : Colors.textSecondary },
//         selectedCategory === item.id && styles.selectedCategoryName
//       ]}>
//         {item.name}
//       </Text>
//     </TouchableOpacity>
//   ));

//   const CartItemCard = React.memo(({ item }) => (
//     <View style={[styles.cartItem, { backgroundColor: Colors.cardBackground }]}>
//       <Image source={{ uri: item.img }} style={styles.cartItemImage} />
//       <View style={styles.cartItemInfo}>
//         <Text style={[styles.cartItemTitle, { color: Colors.textPrimary }]}>{item.title}</Text>
//         <Text style={styles.cartItemPrice}>{item.current_price || item.price}</Text>
//         <View style={styles.quantityContainer}>
//           <TouchableOpacity
//             style={[styles.quantityButton, { backgroundColor: Colors.surface }]}
//             onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
//           >
//             <Ionicons name="remove" size={16} color={Colors.textPrimary} />
//           </TouchableOpacity>
//           <Text style={[styles.quantityText, { color: Colors.textPrimary }]}>{item.quantity}</Text>
//           <TouchableOpacity
//             style={[styles.quantityButton, { backgroundColor: Colors.surface }]}
//             onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
//           >
//             <Ionicons name="add" size={16} color={Colors.textPrimary} />
//           </TouchableOpacity>
//         </View>
//       </View>
//       <TouchableOpacity
//         style={styles.removeButton}
//         onPress={() => handleRemoveFromCart(item._id)}
//       >
//         <Ionicons name="trash-outline" size={20} color={Colors.error} />
//       </TouchableOpacity>
//     </View>
//   ));

//   if (loading) {
//     return (
//       <View style={[styles.loadingContainer, { backgroundColor: Colors.background }]}>
//         <ActivityIndicator size="large" color={"#2E7D31"} />
//         <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading products...</Text>
//       </View>
//     );
//   }

//   if (error && products.length === 0) {
//     return (
//       <View style={[styles.errorContainer, { backgroundColor: Colors.background }]}>
//         <Ionicons name="alert-circle-outline" size={80} color={Colors.error} />
//         <Text style={[styles.errorTitle, { color: Colors.textPrimary }]}>Oops! Something went wrong</Text>
//         <Text style={[styles.errorText, { color: Colors.textSecondary }]}>{error}</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
//           <Text style={styles.retryButtonText}>Try Again</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
//       <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme === 'dark' ? '#121212' : '#4CAF50'} />
//       <ScrollView
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[Colors.primary]}
//             tintColor={Colors.primary}
//           />
//         }
//       >
//         <View style={styles.header}>
//           <View style={styles.headerTop}>
//             <View>
//               <Text style={[styles.headerName, { color: Colors.textPrimary }]}>Aminur tahmid</Text>
//             </View>
//             <TouchableOpacity style={styles.profileButton}>
//               <View style={[styles.profileIcon, { backgroundColor: Colors.surface }]}>
//                 <Ionicons name="person" size={20} color={Colors.primary} />
//               </View>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.searchContainer}>
//             <View style={[styles.searchInputContainer, { backgroundColor: Colors.inputBackground }]}>
//               <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
//               <TextInput
//                 style={[styles.searchInput, { color: Colors.textPrimary }]}
//                 placeholder="Search what do you want?"
//                 placeholderTextColor={Colors.textSecondary}
//                 value={searchQuery}
//                 onChangeText={handleSearch}
//                 returnKeyType="search"
//               />
//             </View>
//             <TouchableOpacity style={[styles.filterButton, { backgroundColor: Colors.inputBackground }]}>
//               <Ionicons name="options-outline" size={20} color={Colors.textSecondary} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.promotionSection}>
//           <ScrollView
//             ref={promoScrollRef}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             onScroll={(e) => {
//               const index = Math.round(e.nativeEvent.contentOffset.x / width);
//               setCurrentSlide(index);
//             }}
//             scrollEventThrottle={16}
//             style={styles.promotionScrollView}
//           >
//             {promotions.map((promo, index) => (
//               <View key={index} style={[styles.promotionBanner, { width }]}>
//                 <View style={[styles.promotionCard, { 
//                   backgroundColor: theme === 'dark' ? '#1E3A1E' : '#F1F8E9',
//                   borderColor: theme === 'dark' ? '#2E5A2E' : '#E8F5E8'
//                 }]}>
//                   <View style={styles.promotionContent}>
//                     <View style={styles.promotionBadge}>
//                       <Text style={styles.promotionDiscount}>{promo.discount}</Text>
//                     </View>
//                     <Text style={[styles.promotionText, { color: theme === 'dark' ? '#A5D6A7' : '#2E7D31' }]}>{promo.text}</Text>
//                     <TouchableOpacity
//                       style={styles.orderNowButton}
//                       onPress={() => {
//                         handlePlaceOrder();
//                         console.log(`Clicked promo: ${promo.discount}`);
//                       }}
//                       activeOpacity={0.8}
//                     >
//                       <Text style={styles.orderNowText}>Order Now</Text>
//                     </TouchableOpacity>
//                   </View>
//                   <View style={styles.promotionImageContainer}>
//                     <View style={styles.imageWrapper}>
//                       <Image
//                         source={{ uri: promo.image }}
//                         style={styles.promotionImage}
//                         resizeMode="cover"
//                       />
//                     </View>
//                   </View>
//                 </View>
//               </View>
//             ))}
//           </ScrollView>
//           <View style={styles.indicatorContainer}>
//             {promotions.map((_, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.indicator,
//                   {
//                     backgroundColor: index === currentSlide ? '#2E7D31' : 'rgba(255, 255, 255, 0.4)',
//                     width: index === currentSlide ? 24 : 8,
//                   }
//                 ]}
//                 onPress={() => {
//                   setCurrentSlide(index);
//                   promoScrollRef.current?.scrollTo({ x: index * width, animated: true });
//                 }}
//                 activeOpacity={0.7}
//               />
//             ))}
//           </View>
//         </View>

//         <View style={styles.section}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.categoriesContainer}
//           >
//             {categories.map((category) => (
//               <CategoryCard key={category.id} item={category} />
//             ))}
//           </ScrollView>
//         </View>

//         {selectedCategory === 'all' && !searchQuery ? (
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Popular Fruits</Text>
//               <TouchableOpacity onPress={() => handleCategorySelect('fruits')}>
//                 <Text style={styles.seeAllText}>See All</Text>
//               </TouchableOpacity>
//             </View>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.productsContainer}
//             >
//               {popularFruits.map((fruit) => (
//                 <ProductCard key={fruit._id} item={fruit} />
//               ))}
//             </ScrollView>
//           </View>
//         ) : (
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
//                 {searchQuery ? `Search Results (${filteredProducts.length})` :
//                   selectedCategory === 'all' ? 'All Products' :
//                     categories.find(c => c.id === selectedCategory)?.name || 'Products'}
//               </Text>
//             </View>

//             {filteredProducts.length > 0 ? (
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.productsContainer}
//               >
//                 {filteredProducts.map((product) => (
//                   <ProductCard key={product._id} item={product} />
//                 ))}
//               </ScrollView>
//             ) : (
//               <View style={styles.emptyResults}>
//                 <Ionicons name="search-outline" size={60} color={Colors.textSecondary} />
//                 <Text style={[styles.emptyResultsTitle, { color: Colors.textPrimary }]}>No products found</Text>
//                 <Text style={[styles.emptyResultsText, { color: Colors.textSecondary }]}>
//                   {searchQuery ?
//                     `No results for "${searchQuery}"` :
//                     `No products in ${categories.find(c => c.id === selectedCategory)?.name || 'this category'}`
//                   }
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}

//         {selectedCategory === 'all' && !searchQuery && (
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>All Products</Text>
//             </View>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.productsContainer}
//             >
//               {products.slice(0, 10).map((product) => (
//                 <ProductCard key={product._id} item={product} />
//               ))}
//             </ScrollView>
//           </View>
//         )}
//       </ScrollView>

//       <TouchableOpacity
//         style={styles.cartIcon}
//         onPress={() => setIsCartVisible(true)}
//         activeOpacity={0.8}
//       >
//       // Continuing from where the code was cut off...

//         <View style={styles.cartIconContainer}>
//           <Ionicons name="bag-outline" size={24} color="#fff" />
//           {cartItemCount > 0 && (
//             <View style={styles.cartBadge}>
//               <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
//             </View>
//           )}
//         </View>
//       </TouchableOpacity>

//       {/* Cart Modal */}
//       <Modal
//         visible={isCartVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setIsCartVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.cartModal, { backgroundColor: Colors.cardBackground }]}>
//             <View style={styles.cartHeader}>
//               <Text style={[styles.cartTitle, { color: Colors.textPrimary }]}>
//                 Your Cart ({cartItemCount} items)
//               </Text>
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => setIsCartVisible(false)}
//               >
//                 <Ionicons name="close" size={24} color={Colors.textPrimary} />
//               </TouchableOpacity>
//             </View>

//             {cartItems.length === 0 ? (
//               <View style={styles.emptyCart}>
//                 <Ionicons name="bag-outline" size={80} color={Colors.textSecondary} />
//                 <Text style={[styles.emptyCartTitle, { color: Colors.textPrimary }]}>
//                   Your cart is empty
//                 </Text>
//                 <Text style={[styles.emptyCartText, { color: Colors.textSecondary }]}>
//                   Add some items to get started
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.continueShopping}
//                   onPress={() => setIsCartVisible(false)}
//                 >
//                   <Text style={styles.continueShoppingText}>Continue Shopping</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <>
//                 <FlatList
//                   data={cartItems}
//                   renderItem={({ item }) => <CartItemCard item={item} />}
//                   keyExtractor={(item) => item._id}
//                   style={styles.cartList}
//                   showsVerticalScrollIndicator={false}
//                 />

//                 <View style={styles.cartFooter}>
//                   <View style={styles.totalContainer}>
//                     <Text style={[styles.totalLabel, { color: Colors.textSecondary }]}>
//                       Total Amount:
//                     </Text>
//                     <Text style={[styles.totalAmount, { color: Colors.textPrimary }]}>
//                       RWF {cartTotal.toFixed(2)}
//                     </Text>
//                   </View>

//                   <View style={styles.cartActions}>
//                     <TouchableOpacity
//                       style={[styles.clearCartButton, { backgroundColor: Colors.error }]}
//                       onPress={() => {
//                         Alert.alert(
//                           'Clear Cart',
//                           'Are you sure you want to clear your cart?',
//                           [
//                             { text: 'Cancel', style: 'cancel' },
//                             {
//                               text: 'Clear',
//                               style: 'destructive',
//                               onPress: clearCart
//                             }
//                           ]
//                         );
//                       }}
//                     >
//                       <Text style={styles.clearCartButtonText}>Clear Cart</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.checkoutButton}
//                       onPress={handlePlaceOrder}
//                       disabled={cartLoading}
//                     >
//                       {cartLoading ? (
//                         <ActivityIndicator size="small" color="#fff" />
//                       ) : (
//                         <Text style={styles.checkoutButtonText}>
//                           Checkout (RWF {cartTotal.toFixed(2)})
//                         </Text>
//                       )}
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginTop: 20,
//     textAlign: 'center',
//   },
//   errorText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 10,
//     lineHeight: 24,
//   },
//   retryButton: {
//     backgroundColor: '#2E7D31',
//     paddingHorizontal: 30,
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 15,
//     paddingBottom: 20,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   headerName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   profileButton: {
//     padding: 5,
//   },
//   profileIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   searchInputContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     borderRadius: 12,
//     gap: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//   },
//   filterButton: {
//     padding: 12,
//     borderRadius: 12,
//   },
//   promotionSection: {
//     paddingBottom: 20,
//   },
//   promotionScrollView: {
//     paddingHorizontal: 20,
//   },
//   promotionBanner: {
//     paddingHorizontal: 0,
//   },
//   promotionCard: {
//     borderRadius: 16,
//     padding: 20,
//     marginHorizontal: 5,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   promotionContent: {
//     flex: 1,
//   },
//   promotionBadge: {
//     backgroundColor: '#2E7D31',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//     marginBottom: 8,
//   },
//   promotionDiscount: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   promotionText: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//     lineHeight: 22,
//   },
//   orderNowButton: {
//     backgroundColor: '#2E7D31',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//   },
//   orderNowText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   promotionImageContainer: {
//     marginLeft: 15,
//   },
//   imageWrapper: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     overflow: 'hidden',
//   },
//   promotionImage: {
//     width: '100%',
//     height: '100%',
//   },
//   indicatorContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 15,
//     gap: 8,
//   },
//   indicator: {
//     height: 8,
//     borderRadius: 4,
//     transition: 'all 0.3s',
//   },
//   section: {
//     paddingHorizontal: 20,
//     marginBottom: 25,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   seeAllText: {
//     color: '#2E7D31',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   categoriesContainer: {
//     paddingRight: 20,
//   },
//   categoryCard: {
//     alignItems: 'center',
//     marginRight: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 5,
//     borderRadius: 12,
//     minWidth: 70,
//   },
//   selectedCategoryCard: {
//     backgroundColor: 'rgba(46, 125, 49, 0.1)',
//   },
//   categoryIcon: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   categoryName: {
//     fontSize: 12,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   selectedCategoryName: {
//     fontWeight: 'bold',
//   },
//   productsContainer: {
//     paddingRight: 20,
//   },
//   productCard: {
//     width: 160,
//     marginRight: 15,
//     borderRadius: 16,
//     overflow: 'hidden',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     borderWidth: 1,
//   },
//   imageContainer: {
//     position: 'relative',
//     height: 120,
//   },
//   productImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   placeholderImage: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   discountBadge: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: '#FF6B35',
//     paddingHorizontal: 6,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   discountText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   addButton: {
//     position: 'absolute',
//     bottom: 8,
//     right: 8,
//     backgroundColor: '#fff',
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   favoriteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: '#fff',
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   productInfo: {
//     padding: 12,
//   },
//   productTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   productPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2E7D31',
//     marginRight: 8,
//   },
//   priceUnit: {
//     fontSize: 12,
//     fontWeight: 'normal',
//   },
//   oldPrice: {
//     fontSize: 12,
//     textDecorationLine: 'line-through',
//   },
//   productRegion: {
//     fontSize: 12,
//   },
//   emptyResults: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   emptyResultsTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 15,
//   },
//   emptyResultsText: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   cartIcon: {
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     backgroundColor: '#2E7D31',
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   cartIconContainer: {
//     position: 'relative',
//   },
//   cartBadge: {
//     position: 'absolute',
//     top: -6,
//     right: -6,
//     backgroundColor: '#FF6B35',
//     minWidth: 20,
//     height: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 4,
//   },
//   cartBadgeText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   cartModal: {
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingTop: 20,
//     maxHeight: '80%',
//   },
//   cartHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0, 0, 0, 0.1)',
//   },
//   cartTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   closeButton: {
//     padding: 5,
//   },
//   emptyCart: {
//     alignItems: 'center',
//     paddingVertical: 60,
//     paddingHorizontal: 20,
//   },
//   emptyCartTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 20,
//   },
//   emptyCartText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   continueShopping: {
//     backgroundColor: '#2E7D31',
//     paddingHorizontal: 30,
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   continueShoppingText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   cartList: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   cartItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cartItemImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 15,
//   },
//   cartItemInfo: {
//     flex: 1,
//   },
//   cartItemTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   cartItemPrice: {
//     fontSize: 14,
//     color: '#2E7D31',
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   quantityButton: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   quantityText: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginHorizontal: 15,
//     minWidth: 20,
//     textAlign: 'center',
//   },
//   removeButton: {
//     padding: 8,
//   },
//   cartFooter: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(0, 0, 0, 0.1)',
//   },
//   totalContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   totalAmount: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#2E7D31',
//   },
//   cartActions: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   clearCartButton: {
//     flex: 1,
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   clearCartButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   checkoutButton: {
//     flex: 2,
//     backgroundColor: '#2E7D31',
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkoutButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default BuyerDashboard;