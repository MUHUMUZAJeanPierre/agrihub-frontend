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
} from "react-native";
import React, { useState, useEffect } from "react";
import { moderateScale } from "react-native-size-matters";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";

const { width: screenWidth } = Dimensions.get('window');

// Enhanced SearchTextInput component
const SearchTextInput = ({ value, onChangeText, placeholder }) => (
  <View style={styles.searchContainer}>
    <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || "Search..."}
      placeholderTextColor="#9CA3AF"
      style={styles.searchInput}
    />
  </View>
);

export default function Farmerdash({ navigation }) {
  const [originalblogs, setOriginalBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [imageLoading, setImageLoading] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [products, setProducts] = useState([]);

  // Mock data
  const mockBlogs = [
    {
      id: 1,
      blogTitle: "Common Wheat Diseases and Prevention",
      blogurl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
      date: "15 Jun 2025",
      description: "Learn effective prevention strategies for common wheat diseases"
    },
    {
      id: 2,
      blogTitle: "Tomato Blight: Early Detection Tips",
      blogurl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop",
      date: "12 Jun 2025",
      description: "Identify tomato blight symptoms before it's too late"
    },
    {
      id: 3,
      blogTitle: "Rice Blast Disease Management",
      blogurl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=300&fit=crop",
      date: "10 Jun 2025",
      description: "Comprehensive guide to managing rice blast disease"
    },
    {
      id: 4,
      blogTitle: "Corn Rust Prevention Strategies",
      blogurl: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop",
      date: "8 Jun 2025",
      description: "Effective methods to prevent corn rust in your fields"
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

  const StatCard = ({ title, value, icon, onPress, gradient }) => (
    <TouchableOpacity onPress={onPress} style={[styles.statCard, gradient && styles.gradientCard]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : '#E8F5E8' }]}>
          {icon}
        </View>
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
            <ActivityIndicator size="small" color="#4ba26a" />
          </View>
        )}
        <Image
          source={{ uri: item.blogurl }}
          style={styles.blogImage}
          onLoad={() => handleImageLoad(item.id)}
          onError={() => handleImageLoad(item.id)}
        />
        <View style={styles.blogImageOverlay} />
      </View>
      <View style={styles.blogContent}>
        <Text style={styles.blogDate}>{item.date}</Text>
        <Text style={styles.blogTitle} numberOfLines={2}>{item.blogTitle}</Text>
        {item.description && (
          <Text style={styles.blogDescription} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.readMoreContainer}>
          <Text style={styles.readMoreText}>Read more</Text>
          <Feather name="arrow-right" size={14} color="#4ba26a" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Farmer Dashboard</Text>
          </View>
          <TouchableOpacity onPress={() => handleNavigation("Add")} style={styles.addButton}>
            <AntDesign name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchWrapper}>
          <SearchTextInput
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              searchFilter(text);
            }}
            placeholder="Search crop diseases..."
          />
        </View>
      </View>


      <View style={styles.contentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Crop Diseases</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
        
      <View style={styles.statsContainer}>
        <StatCard
          title="Products Posted"
          value={totalProducts.toString()}
          icon={<MaterialIcons name="inventory" size={20} color="#4ba26a" />}
          onPress={() => handleNavigation("productsposted")}
        />
        <StatCard
          title="Orders Received"
          value={orders.length.toString()}
          icon={<MaterialIcons name="shopping-cart" size={20} color="white" />}
          onPress={() => handleNavigation("productsorders")}
          gradient={true}
        />
      </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ba26a" />
              <Text style={styles.loadingText}>Loading latest updates...</Text>
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
        </ScrollView>
      </View>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "Poppins_700Bold",
  },
  addButton: {
    backgroundColor: "#4ba26a",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4ba26a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchWrapper: {
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    fontFamily: "Poppins_400Regular",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 0,
    padding: 10,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gradientCard: {
    backgroundColor: "#4ba26a",
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statTitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_500Medium",
    marginBottom: 5,
  },
  statTitleWhite: {
    color: "rgba(255,255,255,0.8)",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4ba26a",
    fontFamily: "Poppins_700Bold",
  },
  statValueWhite: {
    color: "white",
  },
  contentSection: {
    flex: 1,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "Poppins_600SemiBold",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4ba26a",
    fontFamily: "Poppins_500Medium",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  blogList: {
    gap: 15,
  },
  blogCard: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 5,
  },
  blogImageContainer: {
    position: "relative",
    height: 180,
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
    height: 60,
    background: "linear-gradient(transparent, rgba(0,0,0,0.3))",
  },
  imageLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    zIndex: 1,
  },
  blogContent: {
    padding: 20,
  },
  blogDate: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    marginBottom: 8,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 24,
    marginBottom: 8,
  },
  blogDescription: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
    marginBottom: 15,
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  readMoreText: {
    fontSize: 14,
    color: "#4ba26a",
    fontFamily: "Poppins_500Medium",
  },
});