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
  LinearGradient,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://agrihub-backend-4z99.onrender.com/product';

// Enhanced color palette inspired by agriculture and nature
const Colors = {
  // Primary greens - representing growth and nature
  primary: '#2D5016', // Deep forest green
  primaryLight: '#4A7C59', // Sage green
  primaryDark: '#1B3209', // Dark forest
  
  // Secondary earth tones
  secondary: '#8B4513', // Rich earth brown
  secondaryLight: '#CD853F', // Sandy brown
  
  // Accent colors
  accent: '#FF8C42', // Harvest orange
  accentLight: '#FFB347', // Peach
  
  // Fresh greens
  fresh: '#32CD32', // Lime green
  mint: '#98FB98', // Mint green
  
  // Background and surfaces
  background: '#F8FBF6', // Very light green-white
  surface: '#FFFFFF',
  surfaceElevated: '#FEFFFE',
  
  // Text colors
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
  // State Management (keeping all existing state)
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

  // API Configuration (keeping existing logic)
  const apiClient = useMemo(() => axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  }), []);

  // Memoized filtered products (keeping existing logic)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    return products.filter(product =>
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Cart calculations (keeping existing logic)
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const priceMatch = item.price?.match(/RWF\s*([\d,]+)/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // All existing API functions remain the same
  const fetchProducts = useCallback(async (category = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const url = category === 'all' ? '' : `/category/${category}`;
      const response = await apiClient.get(url);
      
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
      } else {
        Alert.alert('Error', 'Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const response = await apiClient.get('/cart');
      const items = response.data?.items || [];
      
      setCartItems(items.map(item => ({
        ...item.product,
        quantity: item.quantity,
        id: item.product._id,
      })));
    } catch (err) {
      console.error('❌ Cart fetch error:', err);
    } finally {
      setCartLoading(false);
    }
  }, [apiClient]);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await apiClient.get('/favorites');
      setFavorites(response.data?.map(item => item._id) || []);
    } catch (err) {
      console.error('❌ Favorites fetch error:', err);
    }
  }, [apiClient]);

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

  const addToCart = useCallback(async (product) => {
    try {
      setAddingToCart(product._id);
      
      await apiClient.post('/cart/add', {
        productId: product._id,
        quantity: 1,
      });
      
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
      
      fetchCart();
    } catch (err) {
      console.error('❌ Add to cart error:', err);
      Alert.alert('Error', 'Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  }, [apiClient, fetchCart]);

  const updateCartQuantity = useCallback(async (productId, quantity) => {
    try {
      setCartItems(prev => prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
      
      await apiClient.put('/cart/update', { productId, quantity });
    } catch (err) {
      console.error('❌ Update cart error:', err);
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
      fetchCart();
    }
  }, [apiClient, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      await apiClient.delete(`/cart/remove/${productId}`);
    } catch (err) {
      console.error('❌ Remove from cart error:', err);
      Alert.alert('Error', 'Failed to remove item. Please try again.');
      fetchCart();
    }
  }, [apiClient, fetchCart]);

  const toggleFavorite = useCallback(async (productId) => {
    try {
      const isFavorite = favorites.includes(productId);
      
      if (isFavorite) {
        setFavorites(prev => prev.filter(id => id !== productId));
        await apiClient.delete(`/favorites/${productId}`);
      } else {
        setFavorites(prev => [...prev, productId]);
        await apiClient.post('/favorites', { productId });
      }
    } catch (err) {
      console.error('❌ Toggle favorite error:', err);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
      fetchFavorites();
    }
  }, [favorites, apiClient, fetchFavorites]);

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

  useEffect(() => {
    fetchProducts();
    fetchCart();
    fetchFavorites();
  }, []);

  // Enhanced Product Card Component
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
  if (loading) {
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
      {/* Enhanced Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>Hello! 👋</Text>
              <Text style={styles.headerTitle}>Discover fresh products</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Enhanced Search Section */}
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
        <Text style={styles.categorySectionTitle}>Ubwoko bw'ibicuruzwa</Text>
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
            <TouchableOpacity 
              onPress={() => setIsCartVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
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
                
                <TouchableOpacity style={styles.checkoutBtn}>
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

export default BuyerDashboard;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background
  },
  
  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  loadingSpinner: {
    position: 'absolute',
    top: -10,
    left: -10,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Error Screen Styles
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Header Styles
  header: {
    backgroundColor: Colors.surface,
    paddingBottom: 20,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  
  // Search Styles
  searchContainer: {
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
    fontWeight: '500',
  },
  
  // Category Styles
  categorySection: {
    backgroundColor: Colors.surface,
    paddingTop: 20,
    paddingBottom: 24,
  },
  categorySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryPill: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    paddingVertical: 2,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  activeCategoryPill: {
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderColor: 'transparent',
  },
  categoryPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '700',
  },
  
  // Products Grid
  productsList: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 120,
  },
  emptyList: {
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: (width - 40) / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  flashDealCard: {
    borderWidth: 2,
    borderColor: Colors.accent,
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  flashDealBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  flashDealText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flashDealAddButton: {
    backgroundColor: Colors.accent,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  
  productInfo: {
    padding: 16,
    gap: 6,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  farmerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  farmerText: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: '600',
    flex: 1,
  },
  
  // Cart Icon
  cartIcon: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  cartIconGradient: {
    backgroundColor: Colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 14,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Modal Styles
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartIconSmall: {
    backgroundColor: Colors.borderLight,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    backgroundColor: Colors.borderLight,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cartLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  cartLoadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  shopNowBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  shopNowBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  
  cartScrollView: {
    flex: 1,
  },
  cartListContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  cartItemPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cartItemInfo: {
    flex: 1,
    gap: 6,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  cartItemViewButton: {
    backgroundColor: Colors.borderLight,
    padding: 8,
    borderRadius: 12,
  },
  cartItemPrice: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cartItemLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartItemRegion: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginRight: 12,
  },
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  quantityButtonRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.borderLight,
    minWidth: 60,
    textAlign: 'center',
  },
  
  cartSummary: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cartSummaryHeader: {
    marginBottom: 16,
  },
  cartSummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deliveryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  deliveryAmount: {
    fontSize: 16,
    fontWeight: '700',
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
    marginBottom: 24,
  },
  grandTotalLabel: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  grandTotalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  clearSearchBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  clearSearchText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

