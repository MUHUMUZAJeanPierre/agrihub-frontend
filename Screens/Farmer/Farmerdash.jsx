import React, { useState, useEffect, useRef } from "react";
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
  Modal,
  Animated,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from '../../contexts/LanguageContext';

const FONTS = {
  regular: "Poppins_400Regular",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

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

const QuickActionButton = ({ icon, label, onPress, color = "#4CAF50", Colors }) => (
  <TouchableOpacity onPress={onPress} style={[styles.quickActionButton, { backgroundColor: Colors.cardBackground }]}>
    <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>{icon}</View>
    <Text style={[styles.quickActionLabel, { color: Colors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
);

const HeaderComponent = ({ username, theme, toggleTheme, language, changeLanguage, Colors, t, styles, navigation }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = async () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              '@auth_token',
              '@user_id',
              '@user_data',
            ]);
            setShowProfileModal(false);
            if (navigation && navigation.reset) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'login' }],
              });
            }
          } catch (err) {
            console.error('Logout error:', err);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.header, { backgroundColor: Colors.background, paddingTop: 20, paddingBottom: 4, shadowColor: 'transparent', borderRadius: 0 }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.headerName, { color: Colors.textPrimary }]}>{username}</Text>
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
              {/* Theme toggle */}
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
              {/* Language toggle */}
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
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: Colors.error, marginTop: 10 }]}
                onPress={handleLogout}
              >
                <Text style={styles.closeButtonText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
};

export default function Farmerdash({ navigation }) {
  const { theme } = useTheme();
  const Colors = theme === 'dark' ? DarkColors : LightColors;
  const { language, changeLanguage, t } = useLanguage();

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

  const fetchOrdersFromAPI = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); // optional: for pull-to-refresh UI

      setOrdersLoading(true);

      const token = await AsyncStorage.getItem('@auth_token');

      // if (!token) {
      //   Alert.alert('Authentication required', 'Please log in to view orders.');
      //   setOrders([]);
      //   return;
      // }

      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
      } else if (result.status === 'success' && Array.isArray(result.data)) {
        setOrders(result.data);
      } else {
        console.warn('Unexpected structure from orders API:', result);
        setOrders([]);
      }

    } catch (error) {
      console.error('Error fetching orders from API:', error);
      Alert.alert(
        'Network Error',
        'Failed to fetch orders. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      setOrders([]);
    } finally {
      setOrdersLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };


  const fetchProductsFromAPI = async () => {
    try {
      setProductsLoading(true);
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


  // const totalOrders = orders.length > 0 ? `${orders.length} order(s)` : 'not found';
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
      case 'Low': return '#4CAF50';
      default: return '#6B7280';
    }
  };

  const StatCard = ({ title, value, onPress, gradient, isLoading }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.statCard,
        gradient && styles.gradientCard,
        { backgroundColor: gradient ? Colors.success : Colors.cardBackground }
      ]}
    >
      <Text style={[
        styles.statTitle,
        { color: gradient ? 'rgba(255,255,255,0.85)' : Colors.textSecondary }
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

  //   const handleReadMore = () => {
  //   navigation.navigate('ArticleDetail', { id: id }); 
  // };

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

        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{item.severity}</Text>
        </View>

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
          {/* <TouchableOpacity onPress={handleReadMore}  style={styles.readMoreContainer}>
            <Text style={[styles.readMoreText, { color: Colors.success }]}>Read Article</Text>
            <Feather name="arrow-right" size={14} color={Colors.success} />
          </TouchableOpacity> */}

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

  const HORIZONTAL_PADDING = 20;
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


  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? "light-content" : "dark-content"}
        backgroundColor={Colors.background}
      />
      <View style={{ paddingHorizontal: HORIZONTAL_PADDING }}>
        <HeaderComponent
          username={getDisplayName()}
          theme={theme}
          toggleTheme={() => { }}
          language={language}
          changeLanguage={changeLanguage}
          Colors={Colors}
          t={t}
          styles={styles}
          navigation={navigation}
        />
        {/* Add search bar below header, with reduced top margin */}
        <View style={[styles.searchWrapper, { marginTop: 4 }]}>
          <View style={[styles.searchContainer]}>
            <View style={[styles.searchInputContainer, { backgroundColor: Colors.inputBackground }]}>
              <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: Colors.textPrimary }]}
                placeholder={t('searchPlaceholder') || "Search crop diseases & solutions..."}
                placeholderTextColor={Colors.textSecondary}
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                  searchFilter(text);
                }}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: Colors.inputBackground }]}
            >
              <Ionicons name="options-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: HORIZONTAL_PADDING }]}
        style={styles.scrollView}
      >
        <View style={[styles.statsContainer, { paddingHorizontal: 0 }]}> {/* Remove extra padding here */}
          <StatCard
            title="Products Listed"
            value={totalProducts.toString()}
            onPress={() => handleNavigation("farmerblog")}
            gradient={false}
            isLoading={ordersLoading}
          />
          <StatCard
            title="Orders Received"
            value={
              orders.length > 0 ? `${orders.length} order(s)` : '0'
            }
            onPress={() => handleNavigation("farmerblog")}
            gradient={true}
            isLoading={ordersLoading}
          />

        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
                Disease Alerts & Prevention
              </Text>
              <Text style={[styles.sectionSubtitle, { color: Colors.textSecondary }]}>
                Stay ahead of crop diseases
              </Text>
            </View>
            {/* <TouchableOpacity style={styles.seeAllButton}>
              <Text style={[styles.seeAllText, { color: Colors.success }]}>See all</Text>
              <Feather name="arrow-right" size={16} color={Colors.success} />
            </TouchableOpacity> */}
          </View>

          {blogsLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.spinnerContainer}>
                <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                  <View style={styles.spinnerOuter}>
                    <View style={styles.spinnerInner} />
                  </View>
                </Animated.View>
                <Text style={styles.loadingText}>
                  {t('loadingBlogs')}
                </Text>
              </View>
            </View>
          ) : blogs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>No disease alerts available</Text>
              <Text style={[styles.loadingSubtext, { color: Colors.textTertiary }]}>Check back later for updates</Text>
            </View>
          ) : (
            <View style={[styles.blogList, { paddingHorizontal: 0 }]}> {/* Remove extra padding here */}
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
    paddingTop: 20,
    // paddingBottom: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Reduce space below headerTop
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
    fontSize: 28,
    fontWeight: "600",
    fontFamily: FONTS.semiBold,
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
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 0,
    height: 54,
    marginBottom: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 8,
  },
  filterButton: {
    marginLeft: 8,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statsContainer: {
    flexDirection: "row",
    // paddingHorizontal: 20, // Remove this line
    paddingTop: 25,
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 80,
    marginBottom: 8,
  },
  gradientCard: {
    backgroundColor: '#4CAF50',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statTitle: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: FONTS.semiBold,
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    // paddingHorizontal: 20, // Remove this line
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1F2937",
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  sectionTitleDark: {
    color: "#F9FAFB",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: FONTS.regular,
  },
  sectionSubtitleDark: {
    color: "#9CA3AF",
    fontFamily: FONTS.regular,
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
    // paddingHorizontal: 20, // Remove this line
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
    fontWeight: "500",
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.regular,
  },
  categoryTextDark: {
    color: "#F9FAFB",
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.regular,
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    fontFamily: FONTS.regular,
  },
  readTime: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: FONTS.regular,
  },
  blogTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#1F2937",
    fontFamily: FONTS.semiBold,
    lineHeight: 28,
    marginBottom: 12,
  },
  blogDescription: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: FONTS.semiBold,
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
    fontFamily: FONTS.semiBold,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileModalContent: {
    width: "90%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    fontFamily: FONTS.semiBold,
  },
  toggleButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    borderColor: "#E0E0E0",
  },
  toggleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: FONTS.semiBold,
  },
  closeButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: FONTS.semiBold,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
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
    borderColor: '#E5E5EA',
    borderTopColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    opacity: 0.6,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
});