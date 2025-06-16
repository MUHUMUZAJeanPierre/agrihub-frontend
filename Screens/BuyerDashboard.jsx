import React, { useEffect, useState, useCallback } from 'react';
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

const { width } = Dimensions.get('window');
const BASE_URL = 'https://agrihub-backend-4z99.onrender.com/api';

const BuyerDashboard = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'Byose (All)' }]);
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]); // Added favorites state
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('ibicuruzwa');

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'organic': 'Kamere (Organic)',
      'vegetables': 'Imboga (Vegetables)', 
      'fruits': 'Imbuto (Fruits)',
      'seeds': 'Imbuto (Seeds)',
      'dairy': 'Amata (Dairy)',
      'grains': 'Ingano (Grains)',
      'meat': 'Inyama (Meat)',
      'beverages': 'Ibinyobwa (Beverages)'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
    fetchFavorites(); // Added fetch favorites
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products, selectedCategory]);

  const filterProducts = useCallback(() => {
    let filtered = products;
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farmer?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, products, selectedCategory]);

  const extractCategoriesFromProducts = (products) => {
    // Get unique categories from products
    const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))];
    
    // Create category objects with proper display names
    const categoryObjects = uniqueCategories.map(category => ({
      id: category,
      name: getCategoryDisplayName(category)
    }));
    
    // Always include "All" as first option
    return [{ id: 'all', name: 'Byose (All)' }, ...categoryObjects];
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/products`);
      const productsData = res.data;
      
      setProducts(productsData);
      
      // Extract and set categories from the products
      const extractedCategories = extractCategoriesFromProducts(productsData);
      setCategories(extractedCategories);
      
    } catch (err) {
      console.error('❌ Product fetch error:', err.message);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await axios.get(`${BASE_URL}/cart`);
      const items = res.data?.items || [];
      setCartItems(items.map((i) => ({
        ...i.product,
        quantity: i.quantity,
        id: i.product._id,
      })));
    } catch (err) {
      console.error('❌ Cart fetch error:', err.message);
    } finally {
      setCartLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/favorites`);
      setFavorites(res.data?.map(item => item._id) || []);
    } catch (err) {
      console.error('❌ Favorites fetch error:', err.message);
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      const isFavorite = favorites.includes(productId);
      
      if (isFavorite) {
        await axios.delete(`${BASE_URL}/favorites/${productId}`);
        setFavorites(prev => prev.filter(id => id !== productId));
      } else {
        await axios.post(`${BASE_URL}/favorites`, { productId });
        setFavorites(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error('❌ Toggle favorite error:', err.message);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchCart(), fetchFavorites()]);
    setRefreshing(false);
  }, []);

  const addToCart = async (product) => {
    try {
      setAddingToCart(product._id);
      await axios.post(`${BASE_URL}/cart/add`, {
        productId: product._id,
        quantity: 1,
      });
      
      Alert.alert(
        '✅ Byongeywe mu gikoni', 
        `${product.title} byongeywe mu gikoni cyawe.`,
        [
          { text: 'Komeza ugure', style: 'cancel' },
          { 
            text: 'Reba igikoni', 
            onPress: () => setIsCartVisible(true)
          }
        ]
      );
      fetchCart();
    } catch (err) {
      console.error('❌ Add to cart error:', err.message);
      Alert.alert('Ikosa', 'Byanze kongera mu gikoni. Ongera ugerageze.');
    } finally {
      setAddingToCart(null);
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      setCartItems(prev => prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
      
      await axios.put(`${BASE_URL}/cart/update`, { productId, quantity });
    } catch (err) {
      console.error('❌ Update cart error:', err.message);
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
      fetchCart();
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      
      await axios.delete(`${BASE_URL}/cart/remove/${productId}`);
    } catch (err) {
      console.error('❌ Remove from cart error:', err.message);
      Alert.alert('Error', 'Failed to remove item. Please try again.');
      fetchCart();
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const priceMatch = item.price?.match(/RWF\s*([\d,]+)/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
      return total + (price * item.quantity);
    }, 0).toLocaleString('en-US');
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={[styles.productCard, item.isFlashDeal && styles.flashDealCard]}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      activeOpacity={0.7}
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
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        {item.isFlashDeal && (
          <View style={styles.flashDealBadge}>
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
            <Ionicons name="add" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <View style={styles.productInfoTop}>
          <View style={styles.productInfoBottom}>
            <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
          </View>
        </View>
        
        <View style={styles.productInfoBottom}>
          <View style={styles.productSecondaryInfo}>
            {item.discount && (
              <Text style={styles.productDescription} numberOfLines={1}>{item.discount}</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item._id);
            }}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={favorites.includes(item._id) ? "heart" : "heart-outline"} 
              size={20} 
              color={favorites.includes(item._id) ? "#e74c3c" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Nta bicuruzwa byabonetse' : 'Nta bicuruzwa bihari'}
      </Text>
      {searchQuery && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
          <Text style={styles.clearSearchText}>Siba ubushakisho</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Search Product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Shakisha ibicuruzwa..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categorySection}>
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
                selectedCategory === category.id && styles.activeCategoryPill
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        contentContainerStyle={[
          styles.productsList,
          filteredProducts.length === 0 && styles.emptyList
        ]}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Cart Icon */}
      <TouchableOpacity 
        style={styles.cartIcon} 
        onPress={() => setIsCartVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="bag-outline" size={24} color="#fff" />
        {getCartItemCount() > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Cart Modal */}
      <Modal visible={isCartVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🛒 Igikoni cyawe</Text>
            <TouchableOpacity onPress={() => setIsCartVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {cartLoading ? (
            <View style={styles.cartLoadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text>Gutegura igikoni...</Text>
            </View>
          ) : cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="bag-outline" size={64} color="#ccc" />
              <Text style={styles.emptyCartText}>Igikoni cyawe nticy uze</Text>
              <TouchableOpacity 
                style={styles.shopNowBtn} 
                onPress={() => setIsCartVisible(false)}
              >
                <Text style={styles.buttonText}>Komeza ugure</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView style={styles.cartScrollView}>
                {cartItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.cartItem}
                    onPress={() => {
                      setIsCartVisible(false);
                      navigation.navigate('ProductDetail', { product: item });
                    }}
                    activeOpacity={0.7}
                  >
                    {item.img ? (
                      <Image source={{ uri: item.img }} style={styles.cartItemImage} />
                    ) : (
                      <View style={styles.cartItemPlaceholder}>
                        <Ionicons name="image-outline" size={20} color="#ccc" />
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
                          <Ionicons name="eye-outline" size={16} color="#4CAF50" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.cartItemPrice}>{item.basePrice}</Text>
                      {item.region && (
                        <Text style={styles.cartItemRegion}>{item.region}, Rwanda</Text>
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
                            style={styles.quantityButton}
                          >
                            <Ionicons 
                              name={item.quantity > 1 ? "remove" : "trash-outline"} 
                              size={16} 
                              color={item.quantity > 1 ? "#666" : "red"} 
                            />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <TouchableOpacity 
                            onPress={(e) => {
                              e.stopPropagation();
                              updateCartQuantity(item.id, item.quantity + 1);
                            }}
                            style={styles.quantityButton}
                          >
                            <Ionicons name="add" size={16} color="#666" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.cartSummary}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Byose ({getCartItemCount()} ibintu):</Text>
                  <Text style={styles.totalAmount}>RWF {getCartTotal()}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutBtn}>
                  <Text style={styles.buttonText}>Komeza urishyure</Text>
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
    backgroundColor: '#f8f9fa' 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageSelector: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  notificationIcon: {
    padding: 4,
  },
  

  tabContainer: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2d5016',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2d5016',
    fontWeight: '600',
  },
  
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingLeft: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 25,
    margin: 4,
  },
  
  // Category Styles
  categorySection: {
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryPill: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  activeCategoryPill: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Section Header
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Products Grid
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 9,
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: (width - 40) / 2,
    overflow: 'hidden',
  },
  flashDealCard: {
    borderWidth: 2,
    borderColor: '#ff4757',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  flashDealBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flashDealText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  flashDealAddButton: {
    backgroundColor: '#ff4757',
  },
  
  productInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  productInfoTop: {
    flex: 1,
  },
  productMainInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  productInfoBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productSecondaryInfo: {
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginLeft: 8,
  },
  
  productTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 4,
  },
  minOrder: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  farmerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  farmerText: {
    fontSize: 11,
    color: '#888',
    flex: 1,
  },
  
  // Cart Icon
  cartIcon: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cartLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cartScrollView: {
    flex: 1,
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
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
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  cartItemViewButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f0f8f0',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#2d5016',
    fontWeight: '600',
    marginBottom: 4,
  },
  cartItemRegion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  quantityButton: {
    padding: 8,
    borderRadius: 16,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  cartSummary: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  checkoutBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  clearSearchBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  clearSearchText: {
    color: '#fff',
    fontWeight: '600',
  },
});