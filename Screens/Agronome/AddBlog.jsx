import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import { TextInput } from "react-native-paper";
import React, { useState, useRef, useEffect, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../contexts/ThemeContext";
import UploadTextInput from "../../Components/uploadtextInpu";
import Button from "../../Components/Button";
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const { width, height } = Dimensions.get("window");

const API_CONFIG = {
  BASE_URL: 'https://agrihub-backend-4z99.onrender.com',
  ENDPOINTS: {
    FARMERS: '/api/farmers',
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
    primary: '#10B981',
    primaryLight: '#D1FAE5',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    shadow: '#000000',
    placeholder: '#9CA3AF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E5E7EB',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
  },
  dark: {
    background: '#000000',
    cardBackground: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    primary: '#10B981',
    primaryLight: '#064E3B',
    secondary: '#3B82F6',
    accent: '#F59E0B',
    shadow: '#000000',
    placeholder: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#374151',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
  },
};

const CATEGORIES = [
  'AI Technology',
  'Sustainability',
  'Smart Farming',
  'Crop Management',
  'Livestock',
  'Irrigation',
  'Pest Control',
  'Soil Health',
  'Weather',
  'Market Analysis',
  'Equipment',
  'General'
];

const SEVERITY_LEVELS = ['Low', 'Medium', 'High'];

export default function AddBlog({ navigation }) {
  const { theme } = useTheme();
  const Colors = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.light, [theme]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // State management
  const [blogData, setBlogData] = useState({
    blogurl: null,
    blogTitle: '',
    description: '',
    category: 'General',
    severity: 'Medium',
    readTime: '5 min read',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Animation effects
  useEffect(() => {
    const initAnimations = Animated.parallel([
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
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    initAnimations.start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Enhanced image picker with better options
  const pickImage = async () => {
    try {
      setIsLoading(true);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload images.'
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
        setBlogData(prev => ({
          ...prev,
          blogurl: result.assets[0].uri
        }));
        setErrors(prev => ({ ...prev, blogurl: null }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!blogData.blogTitle.trim()) {
      newErrors.blogTitle = 'Blog title is required';
    } else if (blogData.blogTitle.length < 10) {
      newErrors.blogTitle = 'Title must be at least 10 characters';
    } else if (blogData.blogTitle.length > 100) {
      newErrors.blogTitle = 'Title must be less than 100 characters';
    }

    if (!blogData.description.trim()) {
      newErrors.description = 'Blog description is required';
    } else if (blogData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (blogData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!blogData.blogurl) {
      newErrors.blogurl = 'Blog image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBlogs = async () => {
  if (!validateForm()) {
    Alert.alert('Validation Error', 'Please fix the errors below.');
    return;
  }

  setIsSubmitting(true);

  try {
    // Get author name from AsyncStorage
    const userData = await AsyncStorage.getItem('@user_data');
    const parsed = JSON.parse(userData);
    const authorName = parsed?.name || 'AgriHub Expert';

    // Prepare blog data with author
    const blogPayload = {
      ...blogData,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      id: `blog-${Date.now()}`,
      author: authorName, 
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FARMERS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogPayload),
    });

    if (response.ok) {
      Alert.alert(
        'Success!',
        'Your blog has been published successfully.',
        [
          { text: 'Add Another', onPress: resetForm },
          { text: 'View Blogs', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      throw new Error('Failed to publish blog');
    }
  } catch (error) {
    console.error('Blog submission error:', error);
    Alert.alert(
      'Upload Failed',
      'There was an error publishing your blog. Please try again.',
      [
        { text: 'Retry', onPress: handleAddBlogs },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  } finally {
    setIsSubmitting(false);
  }
};

  // Reset form
  const resetForm = () => {
    setBlogData({
      blogurl: null,
      blogTitle: '',
      description: '',
      category: 'General',
      severity: 'Medium',
      readTime: '5 min read',
    });
    setErrors({});
  };

  // Update blog data
  const updateBlogData = (field, value) => {
    setBlogData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Category Selection Component
  const CategorySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorLabel, { color: Colors.text }]}>
        Category
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.selectorScroll}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.selectorItem,
              {
                backgroundColor: blogData.category === category ? Colors.primary : Colors.cardBackground,
                borderColor: blogData.category === category ? Colors.primary : Colors.border,
              }
            ]}
            onPress={() => updateBlogData('category', category)}
          >
            <Text style={[
              styles.selectorText,
              {
                color: blogData.category === category ? '#FFFFFF' : Colors.textSecondary,
              }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Severity Selection Component
  const SeveritySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorLabel, { color: Colors.text }]}>
        Priority Level
      </Text>
      <View style={styles.severityContainer}>
        {SEVERITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.severityItem,
              {
                backgroundColor: blogData.severity === level ? Colors.primary : Colors.cardBackground,
                borderColor: blogData.severity === level ? Colors.primary : Colors.border,
              }
            ]}
            onPress={() => updateBlogData('severity', level)}
          >
            <Text style={[
              styles.severityText,
              {
                color: blogData.severity === level ? '#FFFFFF' : Colors.textSecondary,
              }
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.background}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: Colors.text }]}>
                Create New Article
              </Text>
              <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>
                Share your agricultural expertise
              </Text>
            </View>

            {/* Image Upload Section */}
            <View style={[styles.imageSection, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}>
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                Featured Image
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.imageUploadContainer,
                  {
                    borderColor: errors.blogurl ? Colors.error : Colors.border,
                    backgroundColor: blogData.blogurl ? 'transparent' : Colors.background,
                  }
                ]}
                onPress={pickImage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>
                      Processing image...
                    </Text>
                  </View>
                ) : blogData.blogurl ? (
                  <View style={styles.selectedImageContainer}>
                    <Image
                      style={styles.selectedImage}
                      source={{ uri: blogData.blogurl }}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <Text style={styles.changeImageText}>Tap to change</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Text style={[styles.uploadIcon, { color: Colors.primary }]}>📸</Text>
                    <Text style={[styles.uploadText, { color: Colors.textSecondary }]}>
                      Tap to select image
                    </Text>
                    <Text style={[styles.uploadSubtext, { color: Colors.textMuted }]}>
                      Recommended: 16:9 aspect ratio
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {errors.blogurl && (
                <Text style={[styles.errorText, { color: Colors.error }]}>
                  {errors.blogurl}
                </Text>
              )}
            </View>

            {/* Title Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                Article Title
              </Text>
              <UploadTextInput
                placeholder="Enter a compelling title..."
                value={blogData.blogTitle}
                onChangeText={(text) => updateBlogData('blogTitle', text)}
                style={[
                  styles.titleInput,
                  {
                    borderColor: errors.blogTitle ? Colors.error : Colors.border,
                  }
                ]}
                maxLength={100}
              />
              <View style={styles.inputMeta}>
                <Text style={[styles.characterCount, { color: Colors.textMuted }]}>
                  {blogData.blogTitle.length}/100
                </Text>
              </View>
              {errors.blogTitle && (
                <Text style={[styles.errorText, { color: Colors.error }]}>
                  {errors.blogTitle}
                </Text>
              )}
            </View>

            {/* Category Selection */}
            <CategorySelector />

            {/* Severity Selection */}
            <SeveritySelector />

            {/* Description Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                Article Content
              </Text>
              <TextInput
                placeholder="Write your detailed article content here..."
                value={blogData.description}
                onChangeText={(text) => updateBlogData('description', text)}
                multiline
                numberOfLines={8}
                placeholderTextColor={Colors.placeholder}
                style={[
                  styles.descriptionInput,
                  {
                    borderColor: errors.description ? Colors.error : Colors.border,
                    backgroundColor: Colors.cardBackground,
                    color: Colors.text,
                  }
                ]}
                underlineColor="transparent"
                theme={{
                  colors: {
                    primary: Colors.primary,
                    text: Colors.text,
                    background: Colors.cardBackground,
                  },
                  roundness: 16,
                }}
                maxLength={1000}
              />
              <View style={styles.inputMeta}>
                <Text style={[styles.characterCount, { color: Colors.textMuted }]}>
                  {blogData.description.length}/1000
                </Text>
              </View>
              {errors.description && (
                <Text style={[styles.errorText, { color: Colors.error }]}>
                  {errors.description}
                </Text>
              )}
            </View>

            {/* Read Time Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                Estimated Read Time
              </Text>
              <UploadTextInput
                placeholder="e.g., 5 min read"
                value={blogData.readTime}
                onChangeText={(text) => updateBlogData('readTime', text)}
                style={[styles.readTimeInput, { borderColor: Colors.border }]}
              />
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={isSubmitting ? "Publishing..." : "PUBLISH ARTICLE"}
                onPress={handleAddBlogs}
                disabled={isSubmitting}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: isSubmitting ? Colors.textMuted : Colors.primary,
                  }
                ]}
              />
              
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: Colors.border }]}
                onPress={resetForm}
                disabled={isSubmitting}
              >
                <Text style={[styles.resetButtonText, { color: Colors.textSecondary }]}>
                  Clear Form
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  
  // Header
  header: {
    marginBottom: 32,
    alignItems: 'start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Sections
  imageSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  // Image Upload
  imageUploadContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    alignItems: 'center',
  },
  changeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
  },
  
  // Inputs
  titleInput: {
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionInput: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    textAlignVertical: 'top',
    minHeight: 150,
  },
  readTimeInput: {
    fontSize: 14,
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Selectors
  selectorContainer: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectorScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  selectorItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    marginBottom: 8,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  severityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  severityItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    marginBottom: 8,
    flex: 1,
    alignItems: 'center',
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Buttons
  buttonContainer: {
    marginTop: 32,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  resetButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Error handling
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});