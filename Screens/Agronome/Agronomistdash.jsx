
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  Alert,
  FlatList,
  StatusBar,
  Platform,
  Linking,
  Share,
  Vibration,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../contexts/ThemeContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import CategoryFilter from "./CategoryFilter";

const { width, height } = Dimensions.get('window');

const API_CONFIG = {
  BASE_URL: 'https://agrihub-backend-4z99.onrender.com',
  ENDPOINTS: {
    FARMERS: '/api/farmers',
    ANALYTICS: '/api/analytics',
    NOTIFICATIONS: '/api/notifications',
  },
  TIMEOUT: 10000,
};

const THEME_COLORS = {
  light: {
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',
    text: '#1A202C',
    textSecondary: '#718096',
    textMuted: '#A0AEC0',
    searchBackground: '#FFFFFF',
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    primaryDark: '#047857',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    shadow: '#000000',
    modalBackground: '#FFFFFF',
    placeholder: '#9CA3AF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E5E7EB',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
    overlay: 'rgba(0,0,0,0.6)',
    surfaceHighlight: '#F3F4F6',
    weatherGradient: ['#4C9EFF', '#00D4FF'],
    weatherText: '#FFFFFF',
  },
  dark: {
    background: '#000000',
    cardBackground: '#000000',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    searchBackground: '#334155',
    primary: '#10B981',
    primaryLight: '#065F46',
    primaryDark: '#047857',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    shadow: '#000000',
    modalBackground: '#1E293B',
    placeholder: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#334155',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
    overlay: 'rgba(0,0,0,0.8)',
    surfaceHighlight: '#334155',
    weatherGradient: ['#1E3A8A', '#1E40AF'],
    weatherText: '#FFFFFF',
  },
};

const SEVERITY_COLORS = {
  Critical: '#DC2626',
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#10B981',
  Info: '#3B82F6',
};

const PRIORITY_ICONS = {
  Critical: '🚨',
  High: '⚠️',
  Medium: '📊',
  Low: '✅',
  Info: 'ℹ️',
};

// Category icons mapping
const CATEGORY_ICONS = {
  'All': '🌾',
  'AI Technology': '🤖',
  'Sustainability': '🌱',
  'Smart Farming': '📡',
  'Climate Science': '🌡️',
  'Irrigation': '💧',
  'Pest Control': '🐛',
  'Soil Health': '🌱',
  'Fertilizers': '🧪',
  'Crop Management': '🌾',
  'Weather': '⛅',
  'Market Analysis': '📈',
  'Equipment': '🚜',
  'Organic Farming': '🌿',
  'Seeds': '🌱',
  'Harvesting': '🌾',
  'General': '📚',
  'System': '⚙️',
};

export default function Agronomistdash({ navigation }) {
  const { theme } = useTheme();
  const Colors = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.light, [theme]);
  const [username, setUsername] = useState('');

  useEffect(() => {
  const loadUserName = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUsername(parsed.name || 'User');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  loadUserName();
}, []);
  // Enhanced animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const modalSlideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Enhanced state management
  const [state, setState] = useState({
    modalVisible: false,
    loading: true,
    refreshing: false,
    searchFocused: false,
    picurl: null,
    search: '',
    countBlogs: 0,
    blogs: [],
    originalBlogs: [],
    selectedCategory: 'All',
    sortBy: 'date',
    viewMode: 'grid',
    bookmarkedItems: new Set(),
    notifications: [],
    analytics: {
      totalViews: 0,
      engagement: 0,
      trending: [],
    },
    showAnalytics: false,
    networkStatus: 'online',
    weather: {
      location: 'Four Oaks Field',
      date: '14 November 2023',
      greeting: 'Welcome, Barney!',
      today: { temp: '20°C', icon: '☀️' },
      tomorrow: { temp: '20°C', icon: '🌧️' },
      friday: { temp: '20°C', icon: '☀️' },
    },
  });

  const filteredBlogs = useMemo(() => {
    let filtered = state.originalBlogs;

    if (state.search.trim()) {
      filtered = filtered.filter(item =>
        item.blogTitle.toLowerCase().includes(state.search.toLowerCase()) ||
        item.description.toLowerCase().includes(state.search.toLowerCase()) ||
        item.category.toLowerCase().includes(state.search.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(state.search.toLowerCase()))
      );
    }

    if (state.selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === state.selectedCategory);
    }

    // Enhanced sorting
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'title':
          return a.blogTitle.localeCompare(b.blogTitle);
        case 'priority':
          const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
          return priorityOrder[a.severity] - priorityOrder[b.severity];
        case 'readTime':
          return parseInt(a.readTime) - parseInt(b.readTime);
        default:
          return 0;
      }
    });

    return filtered;
  }, [state.search, state.originalBlogs, state.selectedCategory, state.sortBy]);

  // Get enhanced categories with counts
  const categories = useMemo(() => {
    const categoryMap = state.originalBlogs.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'All', count: state.originalBlogs.length },
      ...Object.entries(categoryMap).map(([name, count]) => ({ name, count }))
    ];
  }, [state.originalBlogs]);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Enhanced fetch function with retry mechanism
  const fetchWithTimeout = useCallback(async (url, options = {}, retries = 3) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        if (i === retries - 1) {
          clearTimeout(timeoutId);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }, []);

  // Enhanced fetch blogs data with analytics
  const fetchBlogs = useCallback(async () => {
    try {
      updateState({ loading: true, networkStatus: 'connecting' });

      const [blogsResponse, analyticsResponse] = await Promise.allSettled([
        fetchWithTimeout(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FARMERS}`),
        fetchWithTimeout(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS}`),
      ]);

      let blogsData = [];
      let analyticsData = { totalViews: 0, engagement: 0, trending: [] };

      // Process blogs data
      if (blogsResponse.status === 'fulfilled' && blogsResponse.value.ok) {
        const responseData = await blogsResponse.value.json();

        if (responseData.status === 'success' && responseData.data && Array.isArray(responseData.data)) {
          blogsData = responseData.data;
        } else if (Array.isArray(responseData)) {
          blogsData = responseData;
        }
      }

      // Process analytics data
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.ok) {
        const analyticsRes = await analyticsResponse.value.json();
        if (analyticsRes.status === 'success' && analyticsRes.data) {
          analyticsData = analyticsRes.data;
        }
      }

      // Enhanced blog processing
      const processedBlogs = blogsData.length > 0 ? blogsData.map((blog, index) => ({
        id: blog._id || `blog-${index}`,
        blogTitle: blog.blogTitle || `Article ${index + 1}`,
        blogurl: blog.blogurl || `https://images.unsplash.com/photo-157432334740${index}-f5e1ad6d020b?w=400&h=300&fit=crop`,
        date: blog.date || new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        description: blog.description || 'No description available',
        category: blog.category || 'General',
        readTime: blog.readTime || `${Math.floor(Math.random() * 8) + 3} min read`,
        severity: blog.severity || ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        author: blog.author || 'Unknown Author',
        tags: blog.tags || ['agriculture', 'farming', 'technology'],
        views: blog.views || Math.floor(Math.random() * 1000) + 100,
        likes: blog.likes || Math.floor(Math.random() * 50) + 5,
        featured: blog.featured || Math.random() > 0.8,
      })) : [
        {
          id: 'blog-1',
          blogTitle: "AI-Powered Crop Disease Detection: Revolutionary Breakthrough",
          blogurl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          description: "Discover how cutting-edge artificial intelligence is transforming early disease detection in crops, enabling farmers to prevent catastrophic yield losses with unprecedented accuracy.",
          category: "AI Technology",
          readTime: "6 min read",
          severity: "High",
          author: "Dr. Sarah Chen",
          tags: ["AI", "disease-detection", "precision-farming"],
          views: 1247,
          likes: 89,
          featured: true,
        },
        {
          id: 'blog-2',
          blogTitle: "Sustainable Agriculture: The Future of Food Production",
          blogurl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop",
          date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          description: "Explore innovative sustainable farming techniques that enhance soil health, boost productivity, and protect our environment for future generations.",
          category: "Sustainability",
          readTime: "8 min read",
          severity: "Medium",
          author: "Prof. Michael Rodriguez",
          tags: ["sustainability", "soil-health", "organic-farming"],
          views: 856,
          likes: 64,
          featured: false,
        },
        {
          id: 'blog-3',
          blogTitle: "Smart Irrigation Systems: Maximize Water Efficiency",
          blogurl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=300&fit=crop",
          date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          description: "Master the implementation of intelligent irrigation systems that optimize water usage, reduce costs, and significantly improve crop yields.",
          category: "Smart Farming",
          readTime: "7 min read",
          severity: "Low",
          author: "Dr. Amanda Park",
          tags: ["irrigation", "water-management", "IoT"],
          views: 623,
          likes: 42,
          featured: false,
        },
        {
          id: 'blog-4',
          blogTitle: "Climate-Resilient Crops: Adapting to Change",
          blogurl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
          date: new Date(Date.now() - 259200000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          description: "Learn about breakthrough crop varieties designed to withstand extreme weather conditions and climate change challenges.",
          category: "Climate Science",
          readTime: "9 min read",
          severity: "Critical",
          author: "Dr. James Thompson",
          tags: ["climate-change", "crop-resilience", "genetics"],
          views: 1089,
          likes: 78,
          featured: true,
        },
      ];

      updateState({
        blogs: processedBlogs,
        originalBlogs: processedBlogs,
        countBlogs: processedBlogs.length,
        analytics: analyticsData,
        networkStatus: 'online',
      });
    } catch (error) {
      console.error('Fetch error:', error);
      updateState({ networkStatus: 'offline' });

      // Enhanced fallback with more realistic data
      const fallbackData = [
        {
          id: 'offline-1',
          blogTitle: "Offline Mode: Cached Agriculture Insights",
          blogurl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          description: "Access previously cached agricultural insights and expert recommendations while offline.",
          category: "System",
          readTime: "3 min read",
          severity: "Info",
          author: "AgriHub System",
          tags: ["offline", "cached", "system"],
          views: 0,
          likes: 0,
          featured: false,
        },
      ];

      updateState({
        blogs: fallbackData,
        originalBlogs: fallbackData,
        countBlogs: fallbackData.length,
      });
    } finally {
      updateState({ loading: false });
    }
  }, [updateState, fetchWithTimeout]);

  // Enhanced image picker with compression
  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        updateState({ picurl: result.assets[0].uri });

        // Haptic feedback
        if (Platform.OS === 'ios') {
          Vibration.vibrate(100);
        }

        Alert.alert(
          "Success! 🎉",
          "Your image has been uploaded successfully and is ready for analysis.",
          [{ text: 'Great!' }]
        );
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        "Upload Error",
        "We couldn't upload your image. Please check your device storage and try again.",
        [{ text: 'Try Again', onPress: pickImage }, { text: 'Cancel' }]
      );
    }
  }, [updateState]);

  // Enhanced search with debounce
  const searchTimeoutRef = useRef(null);
  const searchFilter = useCallback((text) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      updateState({ search: text });
    }, 300);
  }, [updateState]);

  // Enhanced category filter
  const filterByCategory = useCallback((category) => {
    updateState({ selectedCategory: category });

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    }
  }, [updateState]);

  // Toggle bookmark
  const toggleBookmark = useCallback((itemId) => {
    updateState(prev => {
      const newBookmarks = new Set(prev.bookmarkedItems);
      if (newBookmarks.has(itemId)) {
        newBookmarks.delete(itemId);
      } else {
        newBookmarks.add(itemId);
      }
      return { bookmarkedItems: newBookmarks };
    });
  }, [updateState]);

  // Enhanced refresh function
  const onRefresh = useCallback(async () => {
    updateState({ refreshing: true });
    try {
      await fetchBlogs();
    } finally {
      updateState({ refreshing: false });
    }
  }, [updateState, fetchBlogs]);

  // Enhanced animation effects
  useEffect(() => {
    const initAnimations = Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    initAnimations.start();

    // Rotation animation for refresh button
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    if (state.refreshing) {
      rotateAnimation.start();
    } else {
      rotateAnimation.stop();
      rotateAnim.setValue(0);
    }
  }, [fadeAnim, slideAnim, scaleAnim, rotateAnim, state.refreshing]);

  // Enhanced modal animations
  useEffect(() => {
    const modalAnim = state.modalVisible
      ? Animated.spring(modalSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
      : Animated.timing(modalSlideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      });

    modalAnim.start();
  }, [state.modalVisible, modalSlideAnim]);

  // Initial data loading
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);



  // Enhanced Blog Item Component
  const BlogItem = React.memo(({ item, index }) => {
    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, [itemAnim, index]);

    return (
      <Animated.View
        style={[
          styles.blogItem,
          {
            backgroundColor: Colors.cardBackground,
            borderColor: Colors.border,
            opacity: itemAnim,
            transform: [{ scale: itemAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('BlogDetail', { blog: item })}
          activeOpacity={0.9}
          style={styles.blogItemTouchable}
        >
          <View style={styles.blogImageContainer}>
            <Image
              source={{ uri: item.blogurl }}
              style={styles.blogImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.blogImageOverlay}
            />
            <View style={styles.blogBadgeContainer}>              
              <View style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[item.severity] }]}>
                <Text style={styles.severityText}>
                  {PRIORITY_ICONS[item.severity]} {item.severity}
                </Text>
              </View>
            </View>

         
          </View>

          <View style={styles.blogContent}>
            <View style={styles.blogHeader}>
              <View style={[styles.categoryTag, { backgroundColor: Colors.primaryLight }]}>
                <Text style={[styles.categoryText, { color: Colors.primary }]}>
                  {CATEGORY_ICONS[item.category] || '📚'} {item.category}
                </Text>
              </View>
              <Text style={[styles.blogAuthor, { color: Colors.textMuted }]}>
                by {item.author}
              </Text>
            </View>

            <Text style={[styles.blogTitle, { color: Colors.text }]} numberOfLines={2}>
              {item.blogTitle}
            </Text>

            <Text style={[styles.blogDescription, { color: Colors.textSecondary }]} numberOfLines={3}>
              {item.description}
            </Text>

            <View style={styles.blogMeta}>
              <View style={styles.blogMetaLeft}>
                <Text style={[styles.blogDate, { color: Colors.textMuted }]}>
                  📅 {item.date}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  });

  // Enhanced Search Component
  const SearchComponent = React.memo(() => (
  <View style={styles.searchSection}>
    <View style={styles.searchContainer}>
      <View style={[styles.searchInputContainer, { backgroundColor: Colors.searchBackground }]}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: Colors.text }]}
          placeholder="Search articles, topics..."
          placeholderTextColor={Colors.textMuted}
          value={state.search}
          onChangeText={searchFilter}
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: Colors.searchBackground }]}
        onPress={() => Alert.alert('Filter', 'Filter options coming soon!')}
      >
        <Ionicons name="options-outline" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  </View>
));



  const HeaderComponent = React.memo(() => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: Colors.text }]}>
            {username ? `${username}'s ` : 'agronomist'}
          </Text>


        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: Colors.primaryLight }]}
            onPress={() => updateState({ showAnalytics: !state.showAnalytics })}
          >
            <Text style={styles.headerButtonText}>📊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: Colors.primaryLight }]}
            onPress={onRefresh}
          >
            <Animated.View
              style={{
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              }}
            >
              <Text style={styles.headerButtonText}>🔄</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ));

  const AnalyticsComponent = React.memo(() => (
    state.showAnalytics && (
      <View style={[styles.analyticsContainer, { backgroundColor: Colors.cardBackground }]}>
        <Text style={[styles.analyticsTitle, { color: Colors.text }]}>
          📈 Analytics Overview
        </Text>
        <View style={styles.analyticsGrid}>
          <View style={[styles.analyticsCard, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.analyticsValue, { color: Colors.primary }]}>
              {/* {state.analytics.totalViews.toLocaleString()} */}
              {state.countBlogs}
            </Text>
            <Text style={[styles.analyticsLabel, { color: Colors.primary }]}>
              Total Views
            </Text>
          </View>
          <View style={[styles.analyticsCard, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.analyticsValue, { color: Colors.primary }]}>
              {state.analytics.engagement}%
            </Text>
            <Text style={[styles.analyticsLabel, { color: Colors.primary }]}>
              Engagement
            </Text>
          </View>
          <View style={[styles.analyticsCard, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.analyticsValue, { color: Colors.primary }]}>
              {state.bookmarkedItems.size}
            </Text>
            <Text style={[styles.analyticsLabel, { color: Colors.primary }]}>
              Bookmarked
            </Text>
          </View>
        </View>
      </View>
    )
  ));




  // Enhanced Empty State Component
  const EmptyStateComponent = React.memo(() => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>🔍</Text>
      <Text style={[styles.emptyStateTitle, { color: Colors.text }]}>
        No articles found
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: Colors.textSecondary }]}>
        Try adjusting your search or filter criteria
      </Text>
      <TouchableOpacity
        style={[styles.emptyStateButton, { backgroundColor: Colors.primary }]}
        onPress={() => {
          updateState({ search: '', selectedCategory: 'All' });
        }}
      >
        <Text style={styles.emptyStateButtonText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  ));

  // Enhanced Loading Component
  const LoadingComponent = React.memo(() => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
        Loading agricultural disease...
      </Text>
    </View>
  ));

  // Enhanced Network Status Component
  const NetworkStatusComponent = React.memo(() => (
    state.networkStatus === 'offline' && (
      <View style={[styles.networkBanner, { backgroundColor: Colors.warning }]}>
        <Text style={styles.networkBannerText}>
          📡 You're offline. Showing cached content.
        </Text>
      </View>
    )
  ));

  // Enhanced Floating Action Button
  const FloatingActionButton = React.memo(() => (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: Colors.primary }]}
      onPress={() => updateState({ modalVisible: true })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.fabGradient}
      >
        <Text style={styles.fabText}>+</Text>
      </LinearGradient>
    </TouchableOpacity>
  ));

  // Main render function
  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.background}
      />

      <NetworkStatusComponent />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <HeaderComponent />
        <AnalyticsComponent />
        <SearchComponent />
        <CategoryFilter
          categories={categories}
          selectedCategory={state.selectedCategory}
          onSelect={filterByCategory}
          Colors={Colors}
        />


        {state.loading ? (
          <LoadingComponent />
        ) : (
          <FlatList
            data={filteredBlogs}
            renderItem={({ item, index }) => <BlogItem item={item} index={index} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.blogList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={state.refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={<EmptyStateComponent />}
            onEndReachedThreshold={0.5}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
          />
        )}
      </Animated.View>
    </View>
  );
}

// Enhanced StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },

  // Weather Header Styles
  weatherHeaderContainer: {
    marginHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  weatherHeaderGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  weatherHeaderContent: {
    flex: 1,
  },
  weatherHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherDate: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 5,
  },
  weatherGreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  weatherLocation: {
    fontSize: 16,
    opacity: 0.8,
  },
  weatherProfileButton: {
    marginLeft: 15,
  },
  weatherProfileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherProfileText: {
    fontSize: 18,
  },
  weatherForecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherDay: {
    alignItems: 'center',
    flex: 1,
  },
  weatherDayLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 5,
  },
  weatherDayIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  weatherDayTemp: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Header Styles
  headerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginTop: 40
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
  },

  // Analytics Styles
  analyticsContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  analyticsCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  analyticsLabel: {
    fontSize: 12,
    opacity: 0.8,
  },

  // Search Styles
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  // searchContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 15,
  //   paddingVertical: 12,
  //   borderRadius: 25,
  //   borderWidth: 2,
  // },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  
    filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  searchClearButton: {
    padding: 5,
  },
  searchClearText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Category Styles
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoryScrollContainer: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Sorting Styles
  sortingContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sortingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  sortingScrollContainer: {
    paddingRight: 20,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 10,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Blog List Styles
  blogList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  blogItem: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
  },
  blogItemTouchable: {
    flex: 1,
  },
  blogImageContainer: {
    position: 'relative',
    height: 200,
  },
  blogImage: {
    width: '100%',
    height: '100%',
  },
  blogImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blogBadgeContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    gap: 8,
  },
  featuredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  blogActionButtons: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  blogContent: {
    padding: 20,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  blogAuthor: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 24,
  },
  blogDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogMetaLeft: {
    flexDirection: 'row',
    gap: 15,
  },
  blogMetaRight: {
    flexDirection: 'row',
    gap: 15,
  },
  blogDate: {
    fontSize: 12,
  },
  blogReadTime: {
    fontSize: 12,
  },
  blogViews: {
    fontSize: 12,
  },
  blogLikes: {
    fontSize: 12,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    maxHeight: height * 0.8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  uploadButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  uploadInfoContainer: {
    marginTop: 20,
  },
  uploadInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  uploadInfoText: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
  },

  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },

  // Network Status Styles
  networkBanner: {
    padding: 10,
    alignItems: 'center',
  },
  networkBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Floating Action Button Styles
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});