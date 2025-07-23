import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

// Color Schemes
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

const SearchScreen = () => {
  const { theme } = useTheme();
  const Colors = theme === 'dark' ? DarkColors : LightColors;
  const styles = createStyles(Colors);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const spinValue = new Animated.Value(0);

  // Categories with dynamic colors
  const CATEGORIES = [
    { id: 'all', name: 'All', icon: 'grid-outline', color: Colors.primary },
    { id: 'fruits', name: 'Fruits', icon: 'nutrition-outline', color: Colors.accent },
    { id: 'dairy', name: 'Dairy', icon: 'water-outline', color: Colors.primary },
    { id: 'vegetables', name: 'Veggies', icon: 'leaf-outline', color: Colors.success },
    { id: 'meat', name: 'Meat', icon: 'restaurant-outline', color: Colors.error },
    { id: 'tubers', name: 'Tubers', icon: 'flower-outline', color: Colors.warning },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchResults.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [searchResults]);

  // Spinner animation
  useEffect(() => {
    if (isSearching || isLoading) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [isSearching, isLoading]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://agrihub-backend-4z99.onrender.com/product');
      const data = await response.json();

      const mappedProducts = data.map((product) => ({
        id: product._id,
        name: product.title,
        price: product.current_price.startsWith('RWF') ? product.current_price : `RWF ${product.current_price}`,
        image: product.img,
        category: product.category,
        rating: Math.floor(Math.random() * 2) + 3 + Math.random().toFixed(1),
        originalPrice: product.past_price,
        discount: calculateDiscount(product.past_price, product.current_price),
      }));

      setAllProducts(mappedProducts);
      
      // If "All" category is selected, show all products
      if (selectedCategory === 'all') {
        setSearchResults(mappedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(true);

    setTimeout(() => {
      let filtered = [];
      
      if (query.length > 0) {
        // Filter by search query
        filtered = allProducts.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        // If no search query, show products based on selected category
        if (selectedCategory === 'all') {
          filtered = allProducts;
        } else {
          filtered = allProducts.filter(product =>
            product.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
      }
      
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.id);
    setSearchQuery(''); // Clear search when selecting category
    setIsSearching(true);

    setTimeout(() => {
      let filtered = [];
      
      if (category.id === 'all') {
        filtered = allProducts;
      } else {
        filtered = allProducts.filter(product =>
          product.category.toLowerCase() === category.name.toLowerCase()
        );
      }
      
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    // Reset to selected category view
    if (selectedCategory === 'all') {
      setSearchResults(allProducts);
    } else {
      const filtered = allProducts.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setSearchResults(filtered);
    }
    setIsSearching(false);
  };

  const calculateDiscount = (oldPrice, newPrice) => {
    const getNumber = (str) => parseFloat(str.replace(/[^\d.]/g, ''));
    const oldP = getNumber(oldPrice);
    const newP = getNumber(newPrice);
    if (!oldP || !newP || newP >= oldP) return null;
    const percent = Math.round(((oldP - newP) / oldP) * 100);
    return `${percent}% OFF`;
  };

  const renderProduct = ({ item }) => (
    <Animated.View style={[styles.productCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.productContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>

          <Text style={styles.categoryText}>{item.category}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{item.price}</Text>
            {item.originalPrice && <Text style={styles.originalPrice}>{item.originalPrice}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={searchQuery.length === 0 ? "search-outline" : "sad-outline"} 
        size={80} 
        color={Colors.textTertiary} 
      />
      <Text style={styles.emptyTitle}>
        {searchQuery.length === 0 ? 'Start Your Search' : 'No Products Found'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.length === 0
          ? 'Discover amazing products by typing in the search bar'
          : `We couldn't find any products matching "${searchQuery}"`}
      </Text>
    </View>
  );

  const renderSearchSuggestions = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.categoriesTitle}>Browse Categories</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryCard,
              selectedCategory === item.id && styles.selectedCategoryCard
            ]}
            onPress={() => handleCategoryPress(item)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="#fff" />
            </View>
            <Text style={[
              styles.categoryName,
              selectedCategory === item.id && styles.selectedCategoryName
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderLoadingSpinner = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.spinnerContainer}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerOuter}>
            <View style={styles.spinnerInner} />
          </View>
        </Animated.View>
        <Text style={styles.loadingText}>
          {isLoading ? 'Loading products...' : 'Searching...'}
        </Text>
      </View>
    </View>
  );

  const getDisplayedProducts = () => {
    if (searchQuery.length > 0) {
      return searchResults;
    } else if (selectedCategory === 'all') {
      return allProducts;
    } else {
      return allProducts.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
  };

  const displayedProducts = getDisplayedProducts();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={Colors.background} />
      <View style={styles.header}>
        {/* <View style={styles.headerContent}>
          <Text style={styles.title}>Search Products</Text>
          <Text style={styles.subtitle}>Find exactly what you need</Text>
        </View> */}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {renderSearchSuggestions()}

      <View style={styles.content}>
        {(isSearching || isLoading) ? (
          renderLoadingSpinner()
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              {displayedProducts.length} result{displayedProducts.length !== 1 ? 's' : ''} found
            </Text>
            <FlatList
              data={displayedProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={renderEmptyState}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  headerContent: {
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 5,
    fontFamily: 'Poppins_400Regular', 
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular', 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    gap: 11,
  },
searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 16,
    textAlign: 'center',
    borderRadius: 12,
    gap: 12,
    fontFamily: 'Poppins_400Regular',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Categories
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    fontFamily: 'Poppins_400Regular', 
  },
   categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
    // backgroundColor: Colors.surfaceLight,
    // borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
   selectedCategoryCard: {
    // backgroundColor: Colors.primaryLight,
    // borderColor: Colors.primaryDark,
    // borderWidth: 2,
  },
 categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: Colors.primaryLight,
  },
   categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    fontFamily: 'Poppins_400Regular', // Apply fontFamily
  },
  selectedCategoryName: {
    color: '#fff', // Highlighted text for selected category
    fontWeight: '600',
  },


  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular', 
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
  },
  
  // Results
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
    fontFamily: 'Poppins_400Regular', 
  },
  listContainer: {
    paddingBottom: 20,
  },
  
  // Product Card
  productCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular', 
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Poppins_400Regular',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular', 
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Poppins_400Regular', 
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    color: Colors.success,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'Poppins_400Regular', 
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    fontFamily: 'Poppins_400Regular',
  },
});

export default SearchScreen;