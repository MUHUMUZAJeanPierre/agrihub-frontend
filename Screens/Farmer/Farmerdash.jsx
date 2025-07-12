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

// API Configuration
const API_BASE_URL = 'https://agrihub-backend-4z99.onrender.com';
const API_ENDPOINTS = {
  FARMERS: `${API_BASE_URL}/api/farmers`,
  ORDERS: `${API_BASE_URL}/api/orders/get-order-without-id`,
  PRODUCTS: `${API_BASE_URL}/product`,
};

const SearchTextInput = ({ value, onChangeText, placeholder, isDark }) => (
  <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
    <View style={styles.searchIconContainer}>
      <Feather name="search" size={20} color="#10B981" />
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || "Search crop diseases..."}
      placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
      style={[styles.searchInput, isDark && styles.searchInputDark]}
    />
    <TouchableOpacity style={styles.filterButton}>
      <Ionicons name="filter" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />
    </TouchableOpacity>
  </View>
);

const QuickActionButton = ({ icon, label, onPress, color = "#10B981", isDark }) => (
  <TouchableOpacity onPress={onPress} style={[styles.quickActionButton, isDark && styles.quickActionButtonDark]}>
    <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>{icon}</View>
    <Text style={[styles.quickActionLabel, isDark && styles.quickActionLabelDark]}>{label}</Text>
  </TouchableOpacity>
);



export default function Farmerdash({ navigation }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      const response = await fetch(API_ENDPOINTS.FARMERS, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        setBlogs(result.data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs from API:', error);
      Alert.alert(
        'Network Error',
        'Failed to load disease alerts. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      setBlogs([]);
    }
  };

  const fetchOrdersFromAPI = async () => {
    try {
      setOrdersLoading(true);
      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
      Alert.alert(
        'Network Error',
        'Failed to load orders. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProductsFromAPI = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch(API_ENDPOINTS.PRODUCTS, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
      Alert.alert(
        'Network Error',
        'Failed to load products. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
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
      isDark && !gradient && styles.statCardDark
    ]}>
      <View style={styles.statCardHeader}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : (isDark ? '#1F2937' : '#E8FDF5') }
        ]}>
          {icon}
        </View>
        {trend && !isLoading && (
          <View style={[
            styles.trendContainer, 
            { backgroundColor: trend === 'up' ? (isDark ? '#1F2937' : '#DCFCE7') : (isDark ? '#2D1B1B' : '#FEF2F2') }
          ]}>
            <Feather
              name={trend === 'up' ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend === 'up' ? '#16A34A' : '#DC2626'}
            />
            <Text style={[styles.trendText, { color: trend === 'up' ? '#16A34A' : '#DC2626' }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text style={[
        styles.statTitle, 
        gradient && styles.statTitleWhite,
        isDark && !gradient && styles.statTitleDark
      ]}>{title}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color={gradient ? "white" : "#10B981"} />
      ) : (
        <Text style={[
          styles.statValue, 
          gradient && styles.statValueWhite,
          isDark && !gradient && styles.statValueDark
        ]}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const BlogCard = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.blogCard, isDark && styles.blogCardDark]}>
      <View style={styles.blogImageContainer}>
        {imageLoading[item.id] !== false && (
          <View style={[styles.imageLoader, isDark && styles.imageLoaderDark]}>
            <ActivityIndicator size="small" color="#10B981" />
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
        <View style={[styles.categoryBadge, isDark && styles.categoryBadgeDark]}>
          <Text style={[styles.categoryText, isDark && styles.categoryTextDark]}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.blogContent}>
        <View style={styles.blogMetaContainer}>
          <Text style={[styles.blogDate, isDark && styles.blogDateDark]}>{item.date}</Text>
          <View style={styles.readTimeContainer}>
            <Feather name="clock" size={12} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
            <Text style={[styles.readTime, isDark && styles.readTimeDark]}>{item.readTime}</Text>
          </View>
        </View>

        <Text style={[styles.blogTitle, isDark && styles.blogTitleDark]} numberOfLines={2}>{item.blogTitle}</Text>

        {item.description && (
          <Text style={[styles.blogDescription, isDark && styles.blogDescriptionDark]} numberOfLines={2}>{item.description}</Text>
        )}

        <View style={styles.blogFooter}>
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMoreText}>Read Article</Text>
            <Feather name="arrow-right" size={14} color="#10B981" />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="bookmark" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="share-2" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? "#1F2937" : "#FFFFFF"} 
      />

      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>{getDisplayName()}</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={isDark ? "#D1D5DB" : "#6B7280"} />
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
            isDark={isDark}
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
            icon={<MaterialIcons name="inventory" size={24} color="#10B981" />}
            onPress={() => handleNavigation("farmerblog")}
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="Orders Received"
            value={totalOrders.toString()}
            icon={<MaterialIcons name="shopping-cart" size={24} color="white" />}
            onPress={() => handleNavigation("farmerblog")}
            gradient={true}
            trend="up"
            trendValue="+23%"
            isLoading={ordersLoading}
          />
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Disease Alerts & Prevention</Text>
              <Text style={[styles.sectionSubtitle, isDark && styles.sectionSubtitleDark]}>Stay ahead of crop diseases</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all</Text>
              <Feather name="arrow-right" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>

          {blogsLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingAnimation}>
                <ActivityIndicator size="large" color="#10B981" />
              </View>
              <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading latest disease alerts...</Text>
              <Text style={[styles.loadingSubtext, isDark && styles.loadingSubtextDark]}>Analyzing crop conditions</Text>
            </View>
          ) : blogs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>No disease alerts available</Text>
              <Text style={[styles.loadingSubtext, isDark && styles.loadingSubtextDark]}>Check back later for updates</Text>
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
    backgroundColor: "#F8FAFC",
  },
  containerDark: {
    backgroundColor: "#111827",
  },
  header: {
    backgroundColor: "white",
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
  headerDark: {
    backgroundColor: "#1F2937",
    shadowColor: "#000",
    shadowOpacity: 0.3,
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
    color: "#1F2937",
    fontFamily: "Poppins_700Bold",
  },
  headerTitleDark: {
    color: "#F9FAFB",
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
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchContainerDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    fontFamily: "Poppins_400Regular",
  },
  searchInputDark: {
    color: "#F9FAFB",
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
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  statCardDark: {
    backgroundColor: "#1F2937",
    shadowOpacity: 0.3,
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
    color: "#6B7280",
    fontFamily: "Poppins_500Medium",
    marginBottom: 8,
  },
  statTitleDark: {
    color: "#9CA3AF",
  },
  statTitleWhite: {
    color: "rgba(255,255,255,0.8)",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
    fontFamily: "Poppins_700Bold",
  },
  statValueDark: {
    color: "#4CAF50",
  },
  statValueWhite: {
    color: "white",
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