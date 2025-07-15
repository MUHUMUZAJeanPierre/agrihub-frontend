import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const THEME_COLORS = {
  light: {
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',
    text: '#1A202C',
    textSecondary: '#718096',
    textMuted: '#A0AEC0',
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    primaryDark: '#047857',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    shadow: '#000000',
    border: '#E5E7EB',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
    overlay: 'rgba(0,0,0,0.6)',
    surfaceHighlight: '#F3F4F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    background: '#000000',
    cardBackground: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    primary: '#10B981',
    primaryLight: '#065F46',
    primaryDark: '#047857',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    shadow: '#000000',
    border: '#334155',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
    overlay: 'rgba(0,0,0,0.8)',
    surfaceHighlight: '#334155',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
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

export default function AgroDetail({ route, navigation }) {
  const { blog } = route.params;
  const { theme } = useTheme();
  const Colors = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.light, [theme]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // State management
  const [state, setState] = useState({
    loading: false,
    refreshing: false,
    bookmarked: false,
    liked: false,
    likeCount: blog.likes || 0,
    viewCount: blog.views || 0,
    readingProgress: 0,
    showFullContent: false,
    relatedArticles: [],
    comments: [],
    showComments: false,
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

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
  }, []);

  // Load saved state
  useEffect(() => {
    loadSavedState();
    incrementViewCount();
  }, [blog.id]);

  const loadSavedState = async () => {
    try {
      const bookmarked = await AsyncStorage.getItem(`bookmark_${blog.id}`);
      const liked = await AsyncStorage.getItem(`like_${blog.id}`);
      
      updateState({
        bookmarked: bookmarked === 'true',
        liked: liked === 'true',
      });
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      const viewKey = `view_${blog.id}`;
      const hasViewed = await AsyncStorage.getItem(viewKey);
      
      if (!hasViewed) {
        await AsyncStorage.setItem(viewKey, 'true');
        updateState(prev => ({ viewCount: prev.viewCount + 1 }));
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const newBookmarked = !state.bookmarked;
      await AsyncStorage.setItem(`bookmark_${blog.id}`, newBookmarked.toString());
      updateState({ bookmarked: newBookmarked });
      
      Alert.alert(
        newBookmarked ? 'Bookmarked! 📌' : 'Bookmark Removed',
        newBookmarked ? 'Article saved for later reading' : 'Article removed from bookmarks'
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const toggleLike = async () => {
    try {
      const newLiked = !state.liked;
      await AsyncStorage.setItem(`like_${blog.id}`, newLiked.toString());
      
      updateState(prev => ({
        liked: newLiked,
        likeCount: newLiked ? prev.likeCount + 1 : prev.likeCount - 1,
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const shareArticle = async () => {
    try {
      const message = `Check out this article: ${blog.blogTitle}\n\n${blog.description}`;
      await Share.share({
        message,
        title: blog.blogTitle,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    updateState({ refreshing: true });
    // Simulate refresh
    setTimeout(() => {
      updateState({ refreshing: false });
    }, 1000);
  }, []);

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    updateState({ readingProgress: Math.min(Math.max(progress, 0), 1) });

    // Header opacity based on scroll
    const opacity = Math.min(contentOffset.y / 200, 1);
    headerOpacity.setValue(opacity);
  };

  const renderProgressBar = () => (
    <View style={[styles.progressContainer, { backgroundColor: Colors.border }]}>
      <View
        style={[
          styles.progressBar,
          {
            width: `${state.readingProgress * 100}%`,
            backgroundColor: Colors.primary,
          },
        ]}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Animated.View
        style={[
          styles.headerBackground,
          {
            backgroundColor: Colors.cardBackground,
            opacity: headerOpacity,
          },
        ]}
      />
      
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: Colors.cardBackground }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Animated.Text
          style={[
            styles.headerTitle,
            {
              color: Colors.text,
              opacity: headerOpacity,
            },
          ]}
          numberOfLines={1}
        >
          {blog.blogTitle}
        </Animated.Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: Colors.cardBackground }]}
            onPress={toggleBookmark}
          >
            <Ionicons
              name={state.bookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={state.bookmarked ? Colors.primary : Colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: Colors.cardBackground }]}
            onPress={shareArticle}
          >
            <Ionicons name="share-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderImageSection = () => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: blog.blogurl }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.imageOverlay}
      />
      
      <View style={styles.imageBadges}>
        <View style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[blog.severity] }]}>
          <Text style={styles.severityText}>
            {PRIORITY_ICONS[blog.severity]} {blog.severity}
          </Text>
        </View>
        
        <View style={[styles.categoryBadge, { backgroundColor: Colors.primaryLight }]}>
          <Text style={[styles.categoryText, { color: Colors.primary }]}>
            {CATEGORY_ICONS[blog.category] || '📚'} {blog.category}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderArticleInfo = () => (
    <Animated.View
      style={[
        styles.articleInfo,
        {
          backgroundColor: Colors.cardBackground,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Text style={[styles.articleTitle, { color: Colors.text }]}>
        {blog.blogTitle}
      </Text>
      
      <View style={styles.articleMeta}>
        <Text style={[styles.authorText, { color: Colors.textSecondary }]}>
          By {blog.author}
        </Text>
        <Text style={[styles.metaDot, { color: Colors.textMuted }]}>•</Text>
        <Text style={[styles.dateText, { color: Colors.textSecondary }]}>
          {blog.date}
        </Text>
        <Text style={[styles.metaDot, { color: Colors.textMuted }]}>•</Text>
        <Text style={[styles.readTimeText, { color: Colors.textSecondary }]}>
          {blog.readTime}
        </Text>
      </View>
    </Animated.View>
  );

  const renderContent = () => (
    <View style={[styles.contentContainer, { backgroundColor: Colors.cardBackground }]}>
      <Text style={[styles.contentText, { color: Colors.text }]}>
        {blog.content || blog.description}
      </Text>
    </View>
  );

  const renderActionButtons = () => null;

  const renderRelatedArticles = () => (
    <View style={[styles.relatedContainer, { backgroundColor: Colors.cardBackground }]}>
      <Text style={[styles.relatedTitle, { color: Colors.text }]}>
        Related Articles
      </Text>
      
      <Text style={[styles.relatedSubtitle, { color: Colors.textSecondary }]}>
        Discover more articles in {blog.category}
      </Text>
      
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: Colors.primary }]}
        onPress={() => Linking.openURL('https://www.google.com')}
      >
        <Text style={styles.exploreButtonText}>
          Explore {blog.category} Articles
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {renderProgressBar()}
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {renderImageSection()}
        {renderArticleInfo()}
        {renderContent()}
        {renderActionButtons()}
        {renderRelatedArticles()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 1000,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingTop: Platform.OS === 'ios' ? 44 : 25,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageBadges: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    gap: 10,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  articleInfo: {
    padding: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 15,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  dateText: {
    fontSize: 14,
  },
  readTimeText: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 14,
  },
  contentContainer: {
    padding: 25,
    marginTop: 10,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  tagsContainer: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 25,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  relatedContainer: {
    padding: 25,
    marginTop: 10,
    alignItems: 'center',
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  relatedSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 50,
  },
});