import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  Modal,
  Animated,
  Share,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FONTS = {
  regular: "Poppins_400Regular",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

// Color Scheme (same as dashboard)
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

  success: '#4ade80',
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

  success: '#4ade80',
  warning: '#FF9800',
  error: '#F44336',

  cardBackground: '#1A1A1A',
  inputBackground: '#2C2C2C',
  borderColor: '#3A3A3A',

  gradient: ['#4A90E2', '#357ABD'],
  orangeGradient: ['#FF6B35', '#FF8A50'],
};

export default function ArticleDetailScreen({ navigation, route }) {
  const { theme = 'light', language = 'en', id: articleId } = route?.params || {};
  const Colors = theme === 'dark' ? DarkColors : LightColors;
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch article data from API
  const fetchArticleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('@auth_token');
      
      if (!articleId) {
        throw new Error('Article ID is required');
      }

      const response = await fetch(`https://agrihub-backend-4z99.onrender.com/api/farmers/${articleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        if (response.status === 404) {
          throw new Error('Article not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        // Map API response to expected article format
        const articleData = {
          id: result.data.id || articleId,
          blogTitle: result.data.blogTitle || result.data.title || 'Article Title',
          blogurl: result.data.blogurl || result.data.imageUrl || 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800',
          severity: result.data.severity || 'Medium',
          category: result.data.category || 'Disease Alert',
          date: result.data.createdAt ? new Date(result.data.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : new Date().toLocaleDateString(),
          readTime: result.data.readTime || '5 min read',
          author: result.data.author || result.data.authorName || 'Agricultural Expert',
          authorAvatar: result.data.authorAvatar || result.data.authorImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100',
          description: result.data.description || result.data.summary || 'Learn about agricultural best practices and disease management.',
          content: result.data.content || result.data.blogContent || '',
          tags: result.data.tags || [],
        };
        
        setArticle(articleData);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError(error.message);
      
      // Set fallback data if API fails
      setArticle({
        id: articleId || 1,
        blogTitle: "Unable to Load Article",
        blogurl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800",
        severity: "Medium",
        category: "Disease Alert",
        date: new Date().toLocaleDateString(),
        readTime: "5 min read",
        author: "Agricultural Expert",
        authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100",
        description: "Unable to load article content. Please check your internet connection and try again.",
        content: "We're sorry, but we couldn't load the article content at this time. Please check your internet connection and try again later.",
        tags: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch related articles from API
  const fetchRelatedArticles = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      
      const response = await fetch('https://agrihub-backend-4z99.onrender.com/api/farmers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          // Filter out current article and get first 3 related articles
          const related = result.data
            .filter(item => item.id !== articleId)
            .slice(0, 3)
            .map(item => ({
              id: item.id,
              title: item.blogTitle || item.title || 'Related Article',
              image: item.blogurl || item.imageUrl || 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400',
              readTime: item.readTime || '5 min',
              severity: item.severity || 'Medium'
            }));
          
          setRelatedArticles(related);
        }
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
      // Set fallback related articles
      setRelatedArticles([
        {
          id: 2,
          title: "Late Blight Prevention in Potatoes",
          image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400",
          readTime: "6 min",
          severity: "Medium"
        },
        {
          id: 3,
          title: "Integrated Pest Management for Vegetables",
          image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
          readTime: "10 min",
          severity: "Low"
        }
      ]);
    }
  };

  useEffect(() => {
    fetchArticleData();
    fetchRelatedArticles();
    // checkBookmarkStatus();
  }, [articleId]);

//   const checkBookmarkStatus = async () => {
//     try {
//       const bookmarks = await AsyncStorage.getItem('@bookmarked_articles');
//       if (bookmarks) {
//         const bookmarkList = JSON.parse(bookmarks);
//         setIsBookmarked(bookmarkList.includes(articleId));
//       }
//     } catch (error) {
//       console.error('Error checking bookmark status:', error);
//     }
//   };


  const toggleBookmark = async () => {
    if (!article) return;
    
    try {
      const bookmarks = await AsyncStorage.getItem('@bookmarked_articles');
      let bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];
      
      if (isBookmarked) {
        bookmarkList = bookmarkList.filter(id => id !== articleId);
      } else {
        bookmarkList.push(articleId);
      }
      
      await AsyncStorage.setItem('@bookmarked_articles', JSON.stringify(bookmarkList));
      setIsBookmarked(!isBookmarked);
      
      Alert.alert(
        'Success',
        isBookmarked ? 'Article removed from bookmarks' : 'Article bookmarked successfully',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  const handleShare = async () => {
    if (!article) return;
    
    try {
      const result = await Share.share({
        message: `Check out this article: ${article.blogTitle}\n\n${article.description}`,
        title: article.blogTitle,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#4CAF50';
      default: return '#6B7280';
    }
  };

  const formatContent = (content) => {
    if (!content || typeof content !== 'string') {
      return [
        <Text key="no-content" style={[styles.paragraph, { color: Colors.textSecondary }]}>
          No content available for this article.
        </Text>
      ];
    }

    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      
      if (paragraph.startsWith('## ')) {
        return (
          <Text key={index} style={[styles.heading, { color: Colors.textPrimary }]}>
            {paragraph.replace('## ', '')}
          </Text>
        );
      }
      
      if (paragraph.startsWith('### ')) {
        return (
          <Text key={index} style={[styles.subheading, { color: Colors.textPrimary }]}>
            {paragraph.replace('### ', '')}
          </Text>
        );
      }
      
      if (paragraph.startsWith('• ')) {
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={[styles.bulletSymbol, { color: Colors.success }]}>•</Text>
            <Text style={[styles.bulletText, { color: Colors.textSecondary }]}>
              {paragraph.replace('• ', '')}
            </Text>
          </View>
        );
      }
      
      return (
        <Text key={index} style={[styles.paragraph, { color: Colors.textSecondary }]}>
          {paragraph}
        </Text>
      );
    }).filter(Boolean);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Show loading screen while fetching data
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <StatusBar
          barStyle={theme === 'dark' ? "light-content" : "dark-content"}
          backgroundColor={Colors.background}
        />
        
        {/* Header with back button */}
        <View style={[styles.loadingHeader, { backgroundColor: Colors.background, borderBottomColor: Colors.borderColor }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.loadingHeaderTitle, { color: Colors.textPrimary }]}>Loading Article...</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.success} />
          <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
            Loading article content...
          </Text>
        </View>
      </View>
    );
  }

  // Show error screen if article failed to load
  if (error && !article) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <StatusBar
          barStyle={theme === 'dark' ? "light-content" : "dark-content"}
          backgroundColor={Colors.background}
        />
        
        {/* Header with back button */}
        <View style={[styles.loadingHeader, { backgroundColor: Colors.background, borderBottomColor: Colors.borderColor }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.loadingHeaderTitle, { color: Colors.textPrimary }]}>Article Not Found</Text>
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={[styles.errorTitle, { color: Colors.textPrimary }]}>
            Unable to Load Article
          </Text>
          <Text style={[styles.errorMessage, { color: Colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: Colors.success }]}
            onPress={() => {
              setError(null);
              fetchArticleData();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? "light-content" : "dark-content"}
        backgroundColor={Colors.background}
      />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.animatedHeader, 
          { 
            backgroundColor: Colors.background,
            opacity: headerOpacity,
            borderBottomColor: Colors.borderColor
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.animatedHeaderTitle, { color: Colors.textPrimary }]} numberOfLines={1}>
          {article.blogTitle}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleBookmark} style={styles.headerActionButton}>
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={isBookmarked ? Colors.success : Colors.textSecondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerActionButton}>
            <Ionicons name="share-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: article.blogurl }}
            style={styles.heroImage}
            onLoad={() => setImageLoading(false)}
          />
          {imageLoading && (
            <View style={[styles.imageLoader, { backgroundColor: Colors.surface }]}>
              <ActivityIndicator size="large" color={Colors.success} />
            </View>
          )}
          
          {/* Back Button Overlay */}
          <TouchableOpacity 
            style={[styles.backButtonOverlay, { backgroundColor: Colors.cardBackground + 'CC' }]}
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Severity Badge */}
          <View style={[styles.severityBadgeOverlay, { backgroundColor: getSeverityColor(article.severity) }]}>
            <Text style={styles.severityText}>{article.severity}</Text>
          </View>
        </View>

        {/* Article Content */}
        <View style={[styles.contentContainer, { backgroundColor: Colors.background }]}>
          {/* Article Header */}
          <View style={styles.articleHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: Colors.success + '20' }]}>
              <Text style={[styles.categoryText, { color: Colors.success }]}>
                {article.category}
              </Text>
            </View>

            <Text style={[styles.articleTitle, { color: Colors.textPrimary }]}>
              {article.blogTitle}
            </Text>

            <Text style={[styles.articleDescription, { color: Colors.textSecondary }]}>
              {article.description}
            </Text>

            {/* Article Meta */}
            <View style={styles.articleMeta}>
              <View style={styles.authorSection}>
                <Image
                  source={{ uri: article.authorAvatar }}
                  style={styles.authorAvatar}
                />
                <View style={styles.authorInfo}>
                  <Text style={[styles.authorName, { color: Colors.textPrimary }]}>
                    {article.author}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaText, { color: Colors.textTertiary }]}>
                      {article.date}
                    </Text>
                    <Text style={[styles.metaDivider, { color: Colors.textTertiary }]}>•</Text>
                    <View style={styles.readTimeContainer}>
                      <Feather name="clock" size={12} color={Colors.textTertiary} />
                      <Text style={[styles.metaText, { color: Colors.textTertiary }]}>
                        {article.readTime}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={toggleBookmark} style={styles.actionButton}>
                  <Ionicons 
                    name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                    size={20} 
                    color={isBookmarked ? Colors.success : Colors.textSecondary} 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Article Body */}
          <View style={styles.articleBody}>
            {formatContent(article.content)}
          </View>

          {/* Related Articles */}
          <View style={styles.relatedSection}>
            <Text style={[styles.relatedTitle, { color: Colors.textPrimary }]}>
              Related Articles
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.relatedArticles}>
                {relatedArticles.map((relatedArticle) => (
                  <TouchableOpacity
                    key={relatedArticle.id}
                    style={[styles.relatedCard, { backgroundColor: Colors.cardBackground }]}
                    onPress={() => {
                      // Navigate to related article
                      navigation?.push('ArticleDetail', { 
                        id: relatedArticle.id,
                        theme: theme,
                        language: language 
                      });
                    }}
                  >
                    <Image
                      source={{ uri: relatedArticle.image }}
                      style={styles.relatedImage}
                    />
                    <View style={styles.relatedContent}>
                      <Text style={[styles.relatedCardTitle, { color: Colors.textPrimary }]} numberOfLines={2}>
                        {relatedArticle.title}
                      </Text>
                      <Text style={[styles.relatedReadTime, { color: Colors.textTertiary }]}>
                        {relatedArticle.readTime}
                      </Text>
                    </View>
                    <View style={[styles.relatedSeverityBadge, { backgroundColor: getSeverityColor(relatedArticle.severity) }]}>
                      <Text style={styles.relatedSeverityText}>{relatedArticle.severity}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 20,
    zIndex: 1000,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  animatedHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
  },
  heroContainer: {
    position: 'relative',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  severityBadgeOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    minHeight: screenHeight - 280,
  },
  articleHeader: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
  },
  articleTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    lineHeight: 36,
    marginBottom: 12,
  },
  articleDescription: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    lineHeight: 24,
    marginBottom: 24,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  metaDivider: {
    fontSize: 12,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  articleBody: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    marginTop: 24,
    marginBottom: 12,
    lineHeight: 28,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    marginTop: 20,
    marginBottom: 10,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'justify',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    lineHeight: 24,
    flex: 1,
  },
  relatedSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginHorizontal: 20,
    marginBottom: 40,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    marginBottom: 16,
  },
  relatedArticles: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 20,
  },
  relatedCard: {
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  relatedImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  relatedContent: {
    padding: 16,
  },
  relatedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    lineHeight: 20,
    marginBottom: 8,
  },
  relatedReadTime: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  relatedSeverityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relatedSeverityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingHeader: {
    height: Platform.OS === 'ios' ? 100 : 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  loadingHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    marginLeft: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
  },
});