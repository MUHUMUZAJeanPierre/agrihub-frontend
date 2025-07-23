import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Share,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { moderateScale } from "react-native-size-matters";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Detail = ({ navigation, route }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Get the blog item from route params or use fallback data
  const blogItem = route?.params || {
    id: 1,
    blogTitle: "Early Detection of Wheat Rust Disease",
    blogurl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop",
    date: "15 Jun 2025",
    description: "Learn to identify wheat rust symptoms early and prevent massive crop losses with proven detection methods.",
    category: "Disease Prevention",
    readTime: "5 min read",
    severity: "High",
    author: "Dr. Sarah Mitchell",
    authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    likes: 342,
    views: 1250,
    lastUpdated: "2 days ago"
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this article: ${blogItem.blogTitle}\n\n${blogItem.description}`,
        title: blogItem.blogTitle,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share this article');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically save to AsyncStorage or API
  };

  const onScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;
    setReadingProgress(Math.min(100, Math.max(0, progress)));
  };


const articleContent = `
Wheat rust is one of the most devastating diseases affecting wheat crops worldwide, capable of destroying entire harvests if left unchecked. This comprehensive guide will help you identify, prevent, and manage wheat rust effectively.

## Understanding Wheat Rust

Wheat rust is a fungal disease caused by Puccinia species that affects wheat plants at various growth stages. The disease manifests in three main types:

• **Stem Rust (Black Rust)** - Attacks stems and leaves
• **Leaf Rust (Brown Rust)** - Primarily affects leaves  
• **Stripe Rust (Yellow Rust)** - Creates distinctive yellow stripes

## Early Detection Signs

### Visual Symptoms
The key to successful management lies in early detection. Look for these warning signs:

**Initial Stage:**
- Small, circular to oval pustules on leaf surfaces
- Reddish-brown to orange colored spores
- Pustules that rupture and release powdery spores

**Advanced Stage:**
- Yellowing and premature death of leaves
- Reduced grain filling and quality
- Significant yield losses (up to 70% in severe cases)

### Environmental Conditions
Wheat rust thrives in specific conditions:
- Temperature: 15-25°C (59-77°F)
- High humidity (above 70%)
- Morning dew or light rainfall
- Dense crop canopies with poor air circulation

## Prevention Strategies

### 1. Resistant Varieties
Plant wheat varieties with proven rust resistance:
- Choose varieties suited to your local climate
- Rotate between different resistant varieties
- Stay updated on new resistant cultivars

### 2. Cultural Practices
- **Crop Rotation**: Implement 2-3 year rotation cycles
- **Field Sanitation**: Remove crop residues completely
- **Proper Spacing**: Ensure adequate plant spacing for air circulation
- **Timely Planting**: Follow recommended seeding dates

### 3. Monitoring and Scouting
- Conduct weekly field surveys during growing season
- Focus on field edges and low-lying areas
- Use mobile apps for disease identification
- Document weather conditions and disease pressure

## Treatment Options

### Organic Solutions
- **Neem Oil**: Apply at first sign of infection
- **Copper-based Fungicides**: Effective for early-stage treatment
- **Biofungicides**: Use beneficial microorganisms
- **Sulfur Dusting**: Traditional but effective method

### Chemical Control
When organic methods aren't sufficient:
- Apply fungicides at early growth stages
- Use systemic fungicides for better penetration
- Follow label instructions for application rates
- Consider tank mixing for broader spectrum control

### Integrated Approach
Combine multiple strategies for best results:
1. Start with resistant varieties
2. Implement cultural practices
3. Monitor regularly
4. Apply treatments when necessary

## Economic Impact and Management

Wheat rust can cause significant economic losses:
- **Yield Loss**: 10-70% depending on severity
- **Quality Reduction**: Lower protein content and test weight
- **Treatment Costs**: $50-150 per hectare for fungicide applications

**Cost-Benefit Analysis:**
Early detection and treatment typically costs $75-100 per hectare but can save $500-1000 in potential losses.

## Technology Integration

### AI-Powered Detection
Modern farming incorporates technology:
- **Drone Surveillance**: Aerial imaging for large-scale monitoring
- **Mobile Apps**: Instant disease identification using photos
- **Weather Stations**: Real-time environmental monitoring
- **Satellite Imagery**: Track disease spread across regions

### Predictive Models
Use weather-based forecasting:
- Monitor temperature and humidity patterns
- Receive early warning alerts
- Plan preventive treatments in advance

## Expert Recommendations

### Timing is Critical
- Begin monitoring at tillering stage
- Increase frequency during flag leaf emergence
- Continue surveillance through grain filling

### Sustainable Practices
- Minimize fungicide resistance through rotation
- Integrate biological control agents
- Maintain soil health for stronger plants
- Consider climate-smart agriculture principles

## Action Plan Checklist

**Pre-Season:**
□ Select resistant varieties
□ Plan crop rotation
□ Prepare monitoring equipment
□ Stock necessary treatments

**During Season:**
□ Conduct weekly field surveys
□ Monitor weather conditions
□ Document disease incidence
□ Apply treatments as needed

**Post-Harvest:**
□ Remove crop residues
□ Analyze season performance
□ Plan improvements for next season
□ Update treatment protocols

## Conclusion

Successful wheat rust management requires a proactive, integrated approach combining resistant varieties, cultural practices, regular monitoring, and timely interventions. By implementing these strategies, farmers can significantly reduce losses and maintain profitable wheat production.

Remember: Prevention is always more cost-effective than treatment. Invest in early detection systems and maintain good agricultural practices for long-term success.

## Additional Resources

For more information on wheat rust management:
- Contact your local agricultural extension office
- Join farmer discussion groups and forums
- Attend workshops on integrated pest management
- Subscribe to crop disease monitoring services

*Stay vigilant, act quickly, and protect your harvest.*
  `;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${readingProgress}%` }]} />
      </View>


      <View style={styles.headerContainer}>
        <Image source={{ uri: blogItem.blogurl }} style={styles.headerImage} />
        
      
        <View style={styles.headerOverlay} />
        <View style={styles.navigationBar}>
          <TouchableOpacity 
            onPress={() => navigation?.goBack()} 
            style={styles.navButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.navActions}>
            <TouchableOpacity onPress={handleShare} style={styles.navButton}>
              <Feather name="share-2" size={22} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleBookmark} style={styles.navButton}>
              <Feather 
                name={isBookmarked ? "bookmark" : "bookmark"} 
                size={22} 
                color={isBookmarked ? "#FFD700" : "white"}
                fill={isBookmarked ? "#FFD700" : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category and Severity Badges */}
        <View style={styles.badgesContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{blogItem.category}</Text>
          </View>
          
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(blogItem.severity) }]}>
            <Text style={styles.severityText}>{blogItem.severity} Risk</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <Text style={styles.articleTitle}>{blogItem.blogTitle}</Text>
          
          <Text style={styles.articleDescription}>{blogItem.description}</Text>
          
          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.authorInfo}>
              <Image 
                source={{ uri: blogItem.authorAvatar }} 
                style={styles.authorAvatar}
              />
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{blogItem.author || "Agricultural Expert"}</Text>
                <Text style={styles.publishDate}>{blogItem.date} • Updated {blogItem.lastUpdated}</Text>
              </View>
            </View>
            
            <View style={styles.articleStats}>
              <View style={styles.statItem}>
                <Feather name="clock" size={16} color="#6B7280" />
                <Text style={styles.statText}>{blogItem.readTime}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Feather name="eye" size={16} color="#6B7280" />
                <Text style={styles.statText}>{blogItem.views || 1250}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Feather name="heart" size={16} color="#EF4444" />
                <Text style={styles.statText}>{blogItem.likes || 342}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          {articleContent.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <Text key={index} style={styles.sectionHeading}>
                  {paragraph.replace('## ', '')}
                </Text>
              );
            } else if (paragraph.startsWith('### ')) {
              return (
                <Text key={index} style={styles.subHeading}>
                  {paragraph.replace('### ', '')}
                </Text>
              );
            } else if (paragraph.startsWith('• ') || paragraph.startsWith('- ')) {
              return (
                <View key={index} style={styles.bulletContainer}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.bulletText}>
                    {paragraph.replace(/^[•-]\s*/, '')}
                  </Text>
                </View>
              );
            } else if (paragraph.startsWith('□ ')) {
              return (
                <View key={index} style={styles.checklistItem}>
                  <View style={styles.checkbox} />
                  <Text style={styles.checklistText}>
                    {paragraph.replace('□ ', '')}
                  </Text>
                </View>
              );
            } else if (paragraph.includes('**') && paragraph.includes(':**')) {
              return (
                <View key={index} style={styles.highlightBox}>
                  <Text style={styles.highlightText}>{paragraph.replace(/\*\*/g, '')}</Text>
                </View>
              );
            } else if (paragraph.trim() && !paragraph.startsWith('#')) {
              return (
                <Text key={index} style={styles.paragraph}>
                  {paragraph.replace(/\*\*/g, '')}
                </Text>
              );
            }
            return null;
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Feather name="download" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Download PDF Guide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <MaterialIcons name="quiz" size={20} color="#10B981" />
            <Text style={styles.secondaryButtonText}>Take Quiz</Text>
          </TouchableOpacity>
        </View>

        {/* Related Articles */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related Articles</Text>
          
          <View style={styles.relatedGrid}>
            {[
              {
                title: "Corn Rust Management",
                image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=300&h=200&fit=crop",
                category: "Disease Control"
              },
              {
                title: "Rice Blast Prevention",
                image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=300&h=200&fit=crop",
                category: "AI Technology"
              }
            ].map((article, index) => (
              <TouchableOpacity key={index} style={styles.relatedCard}>
                <Image source={{ uri: article.image }} style={styles.relatedImage} />
                <View style={styles.relatedContent}>
                  <Text style={styles.relatedCategory}>{article.category}</Text>
                  <Text style={styles.relatedTitle}>{article.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <MaterialIcons name="chat" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 100,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  headerContainer: {
    position: 'relative',
    height: screenHeight * 0.4,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  navigationBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  navActions: {
    flexDirection: 'row',
    gap: 12,
  },
  badgesContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  articleHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  articleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 36,
    marginBottom: 12,
  },
  articleDescription: {
    fontSize: 18,
    color: '#6B7280',
    lineHeight: 26,
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  publishDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  articleStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  articleContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 32,
    marginBottom: 16,
    lineHeight: 32,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 12,
    lineHeight: 28,
  },
  paragraph: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'justify',
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 10,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 3,
    marginTop: 4,
    marginRight: 12,
  },
  checklistText: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  highlightBox: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  highlightText: {
    fontSize: 16,
    color: '#166534',
    lineHeight: 24,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  relatedSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  relatedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  relatedGrid: {
    gap: 16,
  },
  relatedCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  relatedImage: {
    width: 100,
    height: 80,
    backgroundColor: '#E5E7EB',
  },
  relatedContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  relatedCategory: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 4,
  },
  relatedTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    lineHeight: 22,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default Detail;