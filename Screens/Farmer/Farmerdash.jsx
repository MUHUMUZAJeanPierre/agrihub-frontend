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
} from "react-native";
import React, { useState, useEffect } from "react";
import { moderateScale } from "react-native-size-matters";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

const SearchTextInput = ({ value, onChangeText, placeholder }) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchIconContainer}>
      <Feather name="search" size={20} color="#10B981" />
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || "Search crop diseases..."}
      placeholderTextColor="#9CA3AF"
      style={styles.searchInput}
    />
    <TouchableOpacity style={styles.filterButton}>
      <Ionicons name="filter" size={18} color="#6B7280" />
    </TouchableOpacity>
  </View>
);

const QuickActionButton = ({ icon, label, onPress, color = "#10B981" }) => (
  <TouchableOpacity onPress={onPress} style={styles.quickActionButton}>
    <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function Farmerdash({ navigation }) {
  const [originalblogs, setOriginalBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [imageLoading, setImageLoading] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null); 
  const [userLoading, setUserLoading] = useState(true);

  const loadUserData = async () => {
    try {
      setUserLoading(true);
      const userData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);
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


  const mockBlogs = [
    {
      id: 1,
      blogTitle: "Early Detection of Wheat Rust Disease",
      blogurl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
      date: "15 Jun 2025",
      description: "Learn to identify wheat rust symptoms early and prevent massive crop losses with proven detection methods.",
      category: "Disease Prevention",
      readTime: "5 min read",
      severity: "High"
    },
    {
      id: 2,
      blogTitle: "Combat Tomato Blight with Smart Farming",
      blogurl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop",
      date: "12 Jun 2025",
      description: "Revolutionary techniques to prevent and treat tomato blight using IoT sensors and predictive analytics.",
      category: "Smart Farming",
      readTime: "7 min read",
      severity: "Medium"
    },
    {
      id: 3,
      blogTitle: "Rice Blast: AI-Powered Management",
      blogurl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=300&fit=crop",
      date: "10 Jun 2025",
      description: "Use artificial intelligence to predict and manage rice blast disease before it affects your harvest.",
      category: "AI Technology",
      readTime: "6 min read",
      severity: "High"
    },
    {
      id: 4,
      blogTitle: "Sustainable Corn Rust Prevention",
      blogurl: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop",
      date: "8 Jun 2025",
      description: "Eco-friendly strategies to prevent corn rust while maintaining soil health and biodiversity.",
      category: "Sustainability",
      readTime: "4 min read",
      severity: "Low"
    }
  ];

  const mockProducts = Array.from({ length: 24 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}` }));
  const mockOrders = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Order ${i + 1}` }));

  const ReadOrders = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const ReadProduct = async () => {
    try {
      setTimeout(() => {
        setProducts(mockProducts);
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  const ReadBlog = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setBlogs(mockBlogs);
        setOriginalBlogs(mockBlogs);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDatas = async () => {
      await ReadProduct();
      await loadUserData(); // Load user data on component mount
    };
    fetchDatas();
    ReadOrders();
  }, []);

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

  useEffect(() => {
    const fetchDatas = async () => {
      await ReadBlog();
    };
    fetchDatas();
  }, []);

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

  const StatCard = ({ title, value, icon, onPress, gradient, trend, trendValue }) => (
    <TouchableOpacity onPress={onPress} style={[styles.statCard, gradient && styles.gradientCard]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : '#E8FDF5' }]}>
          {icon}
        </View>
        {trend && (
          <View style={[styles.trendContainer, { backgroundColor: trend === 'up' ? '#DCFCE7' : '#FEF2F2' }]}>
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
      <Text style={[styles.statTitle, gradient && styles.statTitleWhite]}>{title}</Text>
      <Text style={[styles.statValue, gradient && styles.statValueWhite]}>{value}</Text>
    </TouchableOpacity>
  );

  const BlogCard = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.blogCard}>
      <View style={styles.blogImageContainer}>
        {imageLoading[item.id] !== false && (
          <View style={styles.imageLoader}>
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
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      
      <View style={styles.blogContent}>
        <View style={styles.blogMetaContainer}>
          <Text style={styles.blogDate}>{item.date}</Text>
          <View style={styles.readTimeContainer}>
            <Feather name="clock" size={12} color="#9CA3AF" />
            <Text style={styles.readTime}>{item.readTime}</Text>
          </View>
        </View>
        
        <Text style={styles.blogTitle} numberOfLines={2}>{item.blogTitle}</Text>
        
        {item.description && (
          <Text style={styles.blogDescription} numberOfLines={2}>{item.description}</Text>
        )}
        
        <View style={styles.blogFooter}>
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMoreText}>Read Article</Text>
            <Feather name="arrow-right" size={14} color="#10B981" />
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="bookmark" size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="share-2" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Function to get display name with fallback
  const getDisplayName = () => {
    if (userLoading) return "Loading...";
    if (!user || !user.name) return "Farmer 👨‍🌾";
    
    // Add farmer emoji if the name doesn't already contain an emoji
    const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(user.name);
    return hasEmoji ? user.name : `${user.name} 👨‍🌾`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{getDisplayName()}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#6B7280" />
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
            value={orders.length.toString()}
            icon={<MaterialIcons name="shopping-cart" size={24} color="white" />}
            onPress={() => handleNavigation("farmerblog")}
            gradient={true}
            trend="up"
            trendValue="+23%"
          />
        </View>

       
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Disease Alerts & Prevention</Text>
              <Text style={styles.sectionSubtitle}>Stay ahead of crop diseases</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all</Text>
              <Feather name="arrow-right" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingAnimation}>
                <ActivityIndicator size="large" color="#10B981" />
              </View>
              <Text style={styles.loadingText}>Loading latest disease alerts...</Text>
              <Text style={styles.loadingSubtext}>Analyzing crop conditions</Text>
            </View>
          ) : (
            <View style={styles.blogList}>
              {blogs.map((item) => (
                <BlogCard
                  key={item.id}
                  item={item}
                  onPress={
                    () => handleNavigation("farmerblog", item)
                    }
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
    backgroundColor: "#10B981",
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
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
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
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
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientCard: {
    backgroundColor: "#10B981",
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
  statTitleWhite: {
    color: "rgba(255,255,255,0.8)",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#10B981",
    fontFamily: "Poppins_700Bold",
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
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#10B981",
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
  loadingSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
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
  categoryText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "500",
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