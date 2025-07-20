import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { moderateScale } from "react-native-size-matters";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { useTheme } from "../../contexts/ThemeContext";

// Color Scheme
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

// API Configuration
const API_BASE_URL = 'https://agrihub-backend-4z99.onrender.com';
const API_ENDPOINTS = {
  FARMERS: `${API_BASE_URL}/api/farmers`,
  ORDERS: `${API_BASE_URL}/api/orders/get-order-without-id`,
  PRODUCTS: `${API_BASE_URL}/product`,
};

const SearchTextInput = ({ value, onChangeText, placeholder, Colors }) => (
  <View style={[styles.searchContainer, { backgroundColor: Colors.inputBackground, borderColor: Colors.borderColor }]}>
    <View style={styles.searchIconContainer}>
      <Feather name="search" size={20} color={Colors.success} />
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || "Search crop diseases..."}
      placeholderTextColor={Colors.textTertiary}
      style={[styles.searchInput, { color: Colors.textPrimary }]}
    />
    <TouchableOpacity style={styles.filterButton}>
      <Ionicons name="filter" size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
  </View>
);

const QuickActionButton = ({ icon, label, onPress, color = "#10B981", Colors }) => (
  <TouchableOpacity onPress={onPress} style={[styles.quickActionButton, { backgroundColor: Colors.cardBackground }]}>
    <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>{icon}</View>
    <Text style={[styles.quickActionLabel, { color: Colors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
);

export default function Farmerdash({ navigation }) {
  const { theme } = useTheme();
  const Colors = theme === 'dark' ? DarkColors : LightColors;

  const [originalblogs, setOriginalBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [imageLoading, setImageLoading] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const loadUserData = async () => {
    try {
      setUserLoading(true);
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: parsedUser.name || 'Farmer',
          email: parsedUser.email,
          avatar: parsedUser.avatar || 'https://via.placeholder.com/150',
          phone: parsedUser.phone || 'N/A',
        });
      } else {
        setUser({
          name: 'Farmer',
          email: '',
          avatar: 'https://via.placeholder.com/150',
          phone: 'N/A',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser({
        name: 'Farmer',
        email: '',
        avatar: 'https://via.placeholder.com/150',
        phone: 'N/A',
      });
    } finally {
      setUserLoading(false);
    }
  };

  const fetchBlogsFromAPI = async () => {
    try {
      // Get authentication token
      const token = await AsyncStorage.getItem('@auth_token');
      
      const response = await fetch(API_ENDPOINTS.FARMERS, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed - token may be invalid or expired');
          setBlogs([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        setBlogs(result.data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs from API:', error);
      if (!error.message.includes('401')) {
        Alert.alert(
          'Network Error',
          'Failed to load disease alerts. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
      setBlogs([]);
    }
  };

  const fetchOrdersFromAPI = async () => {
    try {
      setOrdersLoading(true);
      
      // Get authentication token
      const token = await AsyncStorage.getItem('@auth_token');
      
      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed - token may be invalid or expired');
          setOrders([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (Array.isArray(result)) {
        setOrders(result);
      }
      else if (result.status === 'success' && Array.isArray(result.data)) {
        setOrders(result.data);
      }
      else {
        console.warn('Unexpected structure from orders API:', result);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders from API:', error);
      if (!error.message.includes('401')) {
        Alert.alert(
          'Network Error',
          'Failed to load orders. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProductsFromAPI = async () => {
    try {
      setProductsLoading(true);
      
      // Get authentication token
      const token = await AsyncStorage.getItem('@auth_token');
      
      const response = await fetch(API_ENDPOINTS.PRODUCTS, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed - token may be invalid or expired');
          // Don't show alert for auth errors, just log them
          setProducts([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (Array.isArray(result)) {
        setProducts(result);
      } else if (result.status === 'success' && result.data) {
        setProducts(result.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products from API:', error);
      // Only show alert for network errors, not auth errors
      if (!error.message.includes('401')) {
        Alert.alert(
          'Network Error',
          'Failed to load products. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const mockProducts = Array.from({ length: 24 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}` }));

  const ReadProduct = async () => {
    try {
      setTimeout(() => {
        setProducts(mockProducts);
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchDatas = async () => {
      await loadUserData();
      await fetchOrdersFromAPI();
      await fetchBlogsFromAPI();
      await fetchProductsFromAPI();
    };
    fetchDatas();
  }, []);

  const totalOrders = orders.length;
  const totalProducts = products.length;

  const searchFilter = (text) => {
    const searchText = text.toUpperCase();
    if (text.length > 0) {
      setBlogs(
        originalblogs.filter((item) => {
          const title = item.blogTitle
            ? item.blogTitle.toUpperCase()
            : "".toUpperCase();
          return title.includes(searchText);
        })
      );
    } else {
      setBlogs(originalblogs);
    }
  };

  const handleNavigation = (screen, params = null) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screen, params);
    } else {
      console.log(`Navigate to: ${screen}`, params);
    }
  };

  const handleImageLoad = (id) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const StatCard = ({ title, value, icon, onPress, gradient, trend, trendValue, isLoading }) => (
    <TouchableOpacity onPress={onPress} style={[
      styles.statCard, 
      gradient && styles.gradientCard,
      { backgroundColor: gradient ? Colors.success : Colors.cardBackground }
    ]}>
      <View style={styles.statCardHeader}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : Colors.surfaceLight }
        ]}>
          {icon}
        </View>
        {trend && !isLoading && (
          <View style={[
            styles.trendContainer, 
            { backgroundColor: trend === 'up' ? Colors.surfaceLight : Colors.surfaceLight }
          ]}>
            <Feather
              name={trend === 'up' ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend === 'up' ? Colors.success : Colors.error}
            />
            <Text style={[styles.trendText, { color: trend === 'up' ? Colors.success : Colors.error }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text style={[
        styles.statTitle, 
        { color: gradient ? 'rgba(255,255,255,0.8)' : Colors.textSecondary }
      ]}>{title}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color={gradient ? "white" : Colors.success} />
      ) : (
        <Text style={[
          styles.statValue, 
          { color: gradient ? "white" : Colors.success }
        ]}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const BlogCard = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.blogCard, { backgroundColor: Colors.cardBackground }]}>
      <View style={styles.blogImageContainer}>
        {imageLoading[item.id] !== false && (
          <View style={[styles.imageLoader, { backgroundColor: Colors.surface }]}>
            <ActivityIndicator size="small" color={Colors.success} />
          </View>
        )}
        <Image
          source={{ uri: item.blogurl }}
          style={styles.blogImage}
          onLoad={() => handleImageLoad(item.id)}
          onError={() => handleImageLoad(item.id)}
        />
        <View style={styles.blogImageOverlay} />

        {/* Severity Badge */}
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{item.severity}</Text>
        </View>

        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: Colors.cardBackground + 'E6' }]}>
          <Text style={[styles.categoryText, { color: Colors.textPrimary }]}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.blogContent}>
        <View style={styles.blogMetaContainer}>
          <Text style={[styles.blogDate, { color: Colors.textTertiary }]}>{item.date}</Text>
          <View style={styles.readTimeContainer}>
            <Feather name="clock" size={12} color={Colors.textTertiary} />
            <Text style={[styles.readTime, { color: Colors.textTertiary }]}>{item.readTime}</Text>
          </View>
        </View>

        <Text style={[styles.blogTitle, { color: Colors.textPrimary }]} numberOfLines={2}>{item.blogTitle}</Text>

        {item.description && (
          <Text style={[styles.blogDescription, { color: Colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        )}

        <View style={styles.blogFooter}>
          <View style={styles.readMoreContainer}>
            <Text style={[styles.readMoreText, { color: Colors.success }]}>Read Article</Text>
            <Feather name="arrow-right" size={14} color={Colors.success} />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity key="bookmark" style={styles.actionButton}>
              <Feather name="bookmark" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity key="share" style={styles.actionButton}>
              <Feather name="share-2" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getDisplayName = () => {
    if (userLoading) return "Loading...";
    if (!user || !user.name) return "Farmer";

    const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(user.name);
    return hasEmoji ? user.name : `${user.name} `;
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? "light-content" : "dark-content"} 
        backgroundColor={Colors.background} 
      />

      <View style={[styles.header, { backgroundColor: Colors.cardBackground }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>{getDisplayName()}</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleNavigation("Add")} style={styles.addButton}>
              <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <SearchTextInput
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              searchFilter(text);
            }}
            placeholder="Search crop diseases & solutions..."
            Colors={Colors}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={styles.statsContainer}>
          <StatCard
            title="Products Listed"
            value={totalProducts.toString()}
            // icon={<MaterialIcons name="inventory" size={24} color="#10B981" />}
            onPress={() => handleNavigation("farmerblog")}
            // trend="up"
            // trendValue="+12%"
          />
          <StatCard
            title="Orders Received"
            value={totalOrders.toString()}
            // icon={<MaterialIcons name="shopping-cart" size={24} color="white" />}
            onPress={() => handleNavigation("farmerblog")}
            gradient={true}
            // trend="up"
            // trendValue="+23%"
            isLoading={ordersLoading}
          />
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Disease Alerts & Prevention</Text>
              <Text style={[styles.sectionSubtitle, { color: Colors.textSecondary }]}>Stay ahead of crop diseases</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={[styles.seeAllText, { color: Colors.success }]}>See all</Text>
              <Feather name="arrow-right" size={16} color={Colors.success} />
            </TouchableOpacity>
          </View>

          {blogsLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingAnimation}>
                <ActivityIndicator size="large" color={Colors.success} />
              </View>
              <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Loading latest disease alerts...</Text>
              <Text style={[styles.loadingSubtext, { color: Colors.textTertiary }]}>Analyzing crop conditions</Text>
            </View>
          ) : blogs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>No disease alerts available</Text>
              <Text style={[styles.loadingSubtext, { color: Colors.textTertiary }]}>Check back later for updates</Text>
            </View>
          ) : (
            <View style={styles.blogList}>
              {blogs.map((item) => (
                <BlogCard
                  key={item.id}
                  item={item}
                  onPress={() => handleNavigation("farmerblog", item)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  welcomeText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    fontFamily: "Poppins_700Bold",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  searchWrapper: {
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 25,
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientCard: {
    backgroundColor: "#4CAF50",
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statTitle: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Poppins_700Bold",
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionButtonDark: {
    backgroundColor: "#1F2937",
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
    textAlign: "center",
  },
  quickActionLabelDark: {
    color: "#D1D5DB",
  },
  contentSection: {
    paddingTop: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "Poppins_700Bold",
    marginBottom: 2,
  },
  sectionTitleDark: {
    color: "#F9FAFB",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  sectionSubtitleDark: {
    color: "#9CA3AF",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontFamily: "Poppins_500Medium",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  loadingAnimation: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#4B5563",
    fontFamily: "Poppins_500Medium",
    marginBottom: 8,
  },
  loadingTextDark: {
    color: "#D1D5DB",
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  loadingSubtextDark: {
    color: "#9CA3AF",
  },
  blogList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  blogCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  blogCardDark: {
    backgroundColor: "#1F2937",
    shadowOpacity: 0.3,
  },
  blogImageContainer: {
    position: "relative",
    height: 200,
  },
  blogImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
  },
  blogImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  severityBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  
  categoryBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  categoryBadgeDark: {
    backgroundColor: "rgba(31,41,55,0.9)",
  },

  categoryText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "500",
  },
  categoryTextDark: {
    color: "#F9FAFB",
  },
  imageLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    zIndex: 1,
  },

  blogContent: {
    padding: 24,
  },
  blogMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  blogDate: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readTime: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  blogTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 28,
    marginBottom: 12,
  },
  blogDescription: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
    marginBottom: 20,
  },
  blogFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readMoreText: {
    fontSize: 15,
    color: "#10B981",
    fontFamily: "Poppins_600SemiBold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
});