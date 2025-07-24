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
import { useLanguage } from '../../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../contexts/ThemeContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import CategoryFilter from "./CategoryFilter";

const { width, height } = Dimensions.get('window');

const FONTS = {
  regular: "Poppins_400Regular",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

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
    textPrimary: '#1A202C',
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
    surface: '#F3F4F6',
    weatherGradient: ['#4C9EFF', '#00D4FF'],
    weatherText: '#FFFFFF',
  },
  dark: {
    background: '#0F0F0F',
    cardBackground: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',
    textPrimary: '#FFFFFF',
    searchBackground: '#2A2A2A',
    primary: '#10B981',
    primaryLight: '#1A4B3D',
    primaryDark: '#047857',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    shadow: '#000000',
    modalBackground: '#2A2A2A',
    placeholder: '#666666',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#404040',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
    overlay: 'rgba(0,0,0,0.9)',
    surfaceHighlight: '#2A2A2A',
    surface: '#2A2A2A',
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
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const Colors = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.light, [theme]);
  
  const [username, setUsername] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

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

      const processedBlogs = blogsData.map((blog, index) => ({
        id: blog._id || `blog-${index}`,
        blogTitle: blog.blogTitle || `Article ${index + 1}`,
        blogurl: blog.blogurl || `https://placehold.co/400x300`,
        date: blog.date || new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        description: blog.description || 'No description available',
        category: blog.category || 'General',
        readTime: blog.readTime || `${Math.floor(Math.random() * 8) + 3} min read`,
        severity: blog.severity || 'Medium',
        author: blog.author || 'Unknown',
        tags: blog.tags || [],
        views: blog.views || 0,
        likes: blog.likes || 0,
        featured: blog.featured || false,
      }));

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
          t('permissionRequired'),
          t('uploadImagePermission'),
          [{ text: t('ok') }]
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
          t('success'),
          t('imageUploadSuccess'),
          [{ text: t('great') }]
        );
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        t('uploadErrorTitle'),
        t('uploadError'),
        [{ text: t('tryAgain'), onPress: pickImage }, { text: t('cancel') }]
      );
    }
  }, [updateState, t]);

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

  const filterByCategory = useCallback((category) => {
    updateState({ selectedCategory: category });

    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    }
  }, [updateState]);

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
          onPress={() => navigation.navigate('AgroDetail', { blog: item })}
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

  const SearchComponent = React.memo(() => (
    <View style={styles.searchSection}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: Colors.searchBackground, borderColor: Colors.border }]}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors.text }]}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={Colors.placeholder}
            value={state.search}
            onChangeText={searchFilter}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: Colors.searchBackground, borderColor: Colors.border }]}
          onPress={() => Alert.alert(t('filter'), t('filterOptionsComing'))}
        >
          <Ionicons name="options-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  ));

  const HeaderComponent = React.memo(() => (
    <View style={[styles.headerContainer, { backgroundColor: Colors.background }]}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: Colors.text }]}>
            {username}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: Colors.surfaceHighlight }]}
            onPress={() => setShowProfileModal(true)}
          >
            <Ionicons name="person-circle-outline" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Modal
            visible={showProfileModal}
            animationType="fade"
            transparent
            onRequestClose={() => setShowProfileModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.modalOverlay, { backgroundColor: Colors.overlay }]}
              onPressOut={() => setShowProfileModal(false)}
            >
              <View style={[styles.profileModalContent, { backgroundColor: Colors.modalBackground, borderColor: Colors.border }]}>
                <Text style={[styles.modalTitle, { color: Colors.text }]}>{t('profileOptions')}</Text>

                {/* Theme toggle */}
                <TouchableOpacity
                  style={[styles.toggleButton, { backgroundColor: Colors.surface, borderColor: Colors.border }]}
                  onPress={toggleTheme}
                >
                  <View style={styles.toggleButtonContent}>
                    <Ionicons 
                      name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} 
                      size={24} 
                      color={Colors.textPrimary} 
                    />
                    <Text style={[styles.toggleButtonText, { color: Colors.textPrimary }]}>
                      {theme === 'light' ? t('switchToDark') : t('switchToLight')}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Language toggle */}
                <TouchableOpacity
                  style={[styles.toggleButton, { backgroundColor: Colors.surface, borderColor: Colors.border }]}
                  onPress={() => changeLanguage(language === 'en' ? 'rw' : 'en')}
                >
                  <View style={styles.toggleButtonContent}>
                    <Ionicons name="language-outline" size={24} color={Colors.textPrimary} />
                    <Text style={[styles.toggleButtonText, { color: Colors.textPrimary }]}>
                      {language === 'en' ? t('changeToKinyarwanda') : t('changeToEnglish')}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: Colors.primary }]}
                  onPress={() => setShowProfileModal(false)}
                >
                  <Text style={styles.closeButtonText}>{t('close')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>
    </View>
  ));

  const AnalyticsComponent = React.memo(() => (
    state.showAnalytics && (
      <View style={[styles.analyticsContainer, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}>
        <Text style={[styles.analyticsTitle, { color: Colors.text }]}>
          📈 {t('analyticsOverview')}
        </Text>
        <View style={styles.analyticsGrid}>
          <View style={[styles.analyticsCard, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.analyticsValue, { color: Colors.primary }]}>
              {state.countBlogs}
            </Text>
            <Text style={[styles.analyticsLabel, { color: Colors.primary }]}>
              {t('totalViews')}
            </Text>
          </View>
          <View style={[styles.analyticsCard, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.analyticsValue, { color: Colors.primary }]}>
              {state.analytics.engagement}%
            </Text>
            <Text style={[styles.analyticsLabel, { color: Colors.primary }]}>
              {t('engagement')}
            </Text>
          </View>
          <View style={[styles.analyticsCard, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[styles.analyticsValue, { color: Colors.primary }]}>
              {state.bookmarkedItems.size}
            </Text>
            <Text style={[styles.analyticsLabel, { color: Colors.primary }]}>
              {t('bookmarked')}
            </Text>
          </View>
        </View>
      </View>
    )
  ));

  const EmptyStateComponent = React.memo(() => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>🔍</Text>
      <Text style={[styles.emptyStateTitle, { color: Colors.text }]}>
        {t('noArticlesFound')}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: Colors.textSecondary }]}>
        {t('adjustSearch')}
      </Text>
      <TouchableOpacity
        style={[styles.emptyStateButton, { backgroundColor: Colors.primary }]}
        onPress={() => {
          updateState({ search: '', selectedCategory: 'All' });
        }}
      >
        <Text style={styles.emptyStateButtonText}>{t('clearFilters')}</Text>
      </TouchableOpacity>
    </View>
  ));

  const LoadingComponent = React.memo(() => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
        {t('loadingArticles')}
      </Text>
    </View>
  ));

  // Enhanced Network Status Component
  const NetworkStatusComponent = React.memo(() => (
    state.networkStatus === 'offline' && (
      <View style={[styles.networkBanner, { backgroundColor: Colors.warning }]}>
        <Text style={styles.networkBannerText}>
          📡 {t('offlineBanner')}
        </Text>
      </View>
    )
  ));



  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={Colors.background}
        translucent={false}
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
            contentContainerStyle={[styles.blogList, { paddingBottom: 120 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={state.refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
                progressBackgroundColor={Colors.cardBackground}
              />
            }
            ListEmptyComponent={<EmptyStateComponent />}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            getItemLayout={(data, index) => ({
              length: 280,
              offset: 280 * index,
              index,
            })}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={10}
            removeClippedSubviews={true}
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
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
    fontSize: 24,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  analyticsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analyticsTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  blogList: {
    paddingHorizontal: 20,
  },
  blogItem: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  blogItemTouchable: {
    overflow: 'hidden',
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
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  blogBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  blogContent: {
    padding: 20,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  blogAuthor: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  blogTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
    lineHeight: 24,
  },
  blogDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginBottom: 16,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogMetaLeft: {
    flex: 1,
  },
  blogDate: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  itemSeparator: {
    height: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  networkBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  networkBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontFamily: FONTS.bold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: height * 0.85,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadButtonTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginTop: 16,
    marginBottom: 8,
  },
  uploadButtonSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  analysisOptions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginBottom: 16,
  },
  analysisButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  analysisButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  analysisButtonText: {
    flex: 1,
  },
  analysisButtonTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginBottom: 4,
  },
  analysisButtonSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  analyzeButton: {
    overflow: 'hidden',
  },
  analyzeButtonGradient: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  profileModalContent: {
    width: width * 0.85,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  toggleButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  toggleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleButtonText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
});






