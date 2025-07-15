import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';

import {
  ArrowLeft, Heart, Share2, Plus, Minus,
  ShoppingBag, Star, MapPin, MoreHorizontal, User,
  ShieldCheck, Truck, Clock, Palette
} from 'lucide-react-native';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }) {
  const product = route.params?.product;
  const allProducts = route.params?.allProducts || [];
  const { theme, toggleTheme } = useTheme();

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCart(); 

  // Theme-based styles
  const styles = getStyles(theme);
  const isDark = theme === 'dark';

  const productImages = [
    product?.img,
    product?.img,
    product?.img,
    product?.img
  ].filter(Boolean);

  const relatedProducts = allProducts
    .filter(p => p.category === product?.category && p._id !== product?._id)
    .slice(0, 6);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product data not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayPrice = product.current_price || product.price || '$0.00';
  const basePrice = parseFloat(displayPrice.replace(/[^\d.]/g, '')) || 0;
  const totalPrice = basePrice * quantity;

  const formatPrice = (price) => {
    const currency = displayPrice.replace(/[\d.,]/g, '')[0] || '$';
    return `${currency}${price.toFixed(2)}`;
  };

  const handleAddToCart = () => {
    setAddingToCart(true);
    addToCart(product);
    setTimeout(() => {
      setAddingToCart(false);
      Alert.alert(
        'Added to Cart',
        `${quantity} x ${product.title} has been added to your cart.\nTotal: ${formatPrice(totalPrice)}`
      );
    }, 1000);
  };

  const shareProduct = async () => {
    try {
      await Share.share({
        message: `Check out this product: ${product.title} - ${displayPrice}`,
        title: product.title,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const toggleFavorite = () => {
    setFavorited(!favorited);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#1f2937" : "#2E7D31"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={styles.headerIconColor.color} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleTheme}>
            <Palette size={22} color={styles.headerIconColor.color} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
            <Heart
              size={22}
              color={favorited ? styles.discountBadge.backgroundColor : styles.headerIconColor.color}
              fill={favorited ? styles.discountBadge.backgroundColor : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={shareProduct}>
            <Share2 size={22} color={styles.headerIconColor.color} />
          </TouchableOpacity>          
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.img }}
            style={styles.mainImage}
            resizeMode="contain"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-15%</Text>
            </View>
          </View>
        </View>

        {/* Thumbnail Images */}
        <View style={styles.thumbnailContainer}>
          {productImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                selectedImageIndex === index && styles.selectedThumbnail
              ]}
              onPress={() => setSelectedImageIndex(index)}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Info Card */}
        <View style={styles.productCard}>
          <View style={styles.productHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category || 'Fresh Produce'}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={12} color={styles.ratingText.color} fill={styles.ratingText.color} />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.reviewCount}>(124)</Text>
            </View>
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>

          {/* Price and Quantity */}
          <View style={styles.priceQuantityRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>{formatPrice(totalPrice)}</Text>
              {quantity > 1 && (
                <Text style={styles.unitPrice}>
                  {formatPrice(basePrice)} each
                </Text>
              )}
              <Text style={styles.originalPrice}>{formatPrice(basePrice * 1.15)}</Text>
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} color={quantity <= 1 ? (isDark ? "#4b5563" : "#d1d5db") : styles.accentLight} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} color={styles.accentLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <ShieldCheck size={16} color={styles.accentLight} />
              <Text style={styles.featureText}>Organic Certified</Text>
            </View>
            <View style={styles.feature}>
              <Truck size={16} color={styles.accentLight} />
              <Text style={styles.featureText}>Fast Delivery</Text>
            </View>
            <View style={styles.feature}>
              <Clock size={16} color={styles.accentLight} />
              <Text style={styles.featureText}>Fresh Daily</Text>
            </View>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerCard}>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerInitial}>
                  {(product.farmer || 'Fanny Fruits')[0]}
                </Text>
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{product.farmer || 'Fanny Fruits'}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={12} color={styles.secondaryText.color} />
                  <Text style={styles.sellerLocation}>{product.region || 'Nyaruguru'}</Text>
                </View>
                <View style={styles.sellerStats}>
                  <Text style={styles.statText}>98% Positive • 500+ Sales</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About this product</Text>
            <Text style={styles.description}>
              {product.description ||
                "Fresh, high-quality produce sourced directly from local farmers. Rich in nutrients and harvested at peak ripeness to ensure maximum flavor and freshness. Perfect for healthy meals and nutritious snacking."}
            </Text>
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>You might also like</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScrollContent}
            >
              {relatedProducts.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.relatedCard}
                  onPress={() => navigation.push('ProductDetailScreen', {
                    product: item,
                    allProducts,
                  })}
                >
                  <View style={styles.relatedImageContainer}>
                    <Image
                      source={{ uri: item.img }}
                      style={styles.relatedImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity style={styles.relatedFavoriteButton}>
                      <Heart size={12} color={styles.secondaryText.color} />
                    </TouchableOpacity>
                    <View style={styles.relatedDiscountBadge}>
                      <Text style={styles.relatedDiscountText}>-10%</Text>
                    </View>
                  </View>
                  <View style={styles.relatedInfo}>
                    <View style={styles.relatedRating}>
                      <Text style={styles.relatedItemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {item.region && (
                        <Text style={styles.productRegion} numberOfLines={1}>
                          📍 {item.region}
                        </Text>
                      )}
                    </View>
                    <View style={styles.relatedPriceRow}>
                      <Text style={styles.relatedPrice}>
                        {item.current_price || item.price}
                      </Text>
                      <Text style={styles.relatedOriginalPrice}>
                        ${(parseFloat((item.current_price || item.price).replace(/[^\d.]/g, '')) * 1.1).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.relatedAddButton}>
                    <Plus size={14} color={styles.accentLight} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Buy Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          <View style={styles.bottomPriceInfo}>
            <Text style={styles.bottomTotalLabel}>Total Price</Text>
            <Text style={styles.bottomTotalPrice}>{formatPrice(totalPrice)}</Text>
            <Text style={styles.bottomSavings}>You save {formatPrice(basePrice * 0.15 * quantity)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.buyButton, addingToCart && styles.buyButtonDisabled]}
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <ShoppingBag size={20} color="#fff" />
                <Text style={styles.buyButtonText}>Add to Cart ({quantity})</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => {
  const isDark = theme === 'dark';
  
  const colors = {
    background: isDark ? '#111827' : '#ffffff',
    cardBackground: isDark ? '#1f2937' : '#ffffff',
    secondaryBackground: isDark ? '#374151' : '#f8f9fa',
    lightBackground: isDark ? '#2d3748' : '#f9fafb',
    border: isDark ? '#374151' : '#e5e7eb',
    lightBorder: isDark ? '#4b5563' : '#f3f4f6',
    primaryText: isDark ? '#f9fafb' : '#1f2937',
    secondaryText: isDark ? '#d1d5db' : '#6b7280',
    mutedText: isDark ? '#9ca3af' : '#9ca3af',
    accent: '#2E7D31',
    accentLight: '#10b981',
    accentRed: '#ef4444',
    accentYellow: '#fbbf24',
    accentGreen: '#16a34a',
    accentBadge: isDark ? '#064e3b' : '#dcfce7',
    accentBadgeBorder: isDark ? '#10b981' : '#bbf7d0',
    ratingBg: isDark ? '#451a03' : '#fef3c7',
    ratingText: isDark ? '#fbbf24' : '#92400e',
    favoriteBtnBg: isDark ? 'rgba(31,41,55,0.9)' : 'rgba(255,255,255,0.9)',
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 16,
    },
    goBackButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
    },
    goBackText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },

    // Header Styles
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightBorder,
    },
    headerButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.lightBackground,
      borderRadius: 22,
      marginRight: 8,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIconColor: {
      color: colors.primaryText,
    },

    imageContainer: {
      height: 320,
      backgroundColor: colors.secondaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      position: 'relative',
    },
    mainImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    discountBadge: {
      backgroundColor: colors.accentRed,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    discountText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
    },
    thumbnailContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
      backgroundColor: colors.background,
    },
    thumbnail: {
      width: 64,
      height: 64,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.border,
    },
    selectedThumbnail: {
      borderColor: colors.accentLight,
      borderWidth: 3,
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
    },

    // Product Card Styles
    productCard: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 20,
      marginTop: 8,
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    productHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    categoryBadge: {
      backgroundColor: isDark ? colors.cardBackground : colors.accentBadge,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? colors.accentLight : 'transparent',
    },
    categoryText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '500',
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.ratingBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.ratingText,
    },
    reviewCount: {
      fontSize: 11,
      color: colors.ratingText,
    },
    productTitle: {
      fontSize: 26,
      fontWeight: '500',
      color: colors.primaryText,
      marginBottom: 16,
      lineHeight: 32,
    },
    priceQuantityRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    priceContainer: {
      flex: 1,
    },
    productPrice: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.accent,
      marginBottom: 4,
    },
    unitPrice: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: 2,
    },
    originalPrice: {
      fontSize: 14,
      color: colors.mutedText,
      textDecorationLine: 'line-through',
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.lightBackground,
      borderRadius: 28,
      paddingHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quantityButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 18,
      margin: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    quantityButtonDisabled: {
      backgroundColor: colors.lightBackground,
    },
    quantityText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primaryText,
      marginHorizontal: 20,
      minWidth: 24,
      textAlign: 'center',
    },
    secondaryText: {
      color: colors.secondaryText,
    },

    // Features
    featuresContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: isDark ? '#064e3b' : '#f0fdf4',
      paddingVertical: 16,
      borderRadius: 16,
      marginBottom: 24,
    },
    feature: {
      alignItems: 'center',
      gap: 8,
    },
    featureText: {
      fontSize: 12,
      color: colors.accent,
      fontWeight: '500',
    },

    // Seller Card
    sellerCard: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    sellerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    sellerAvatar: {
      width: 48,
      height: 48,
      backgroundColor: colors.accent,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sellerInitial: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '500',
    },
    sellerDetails: {
      flex: 1,
    },
    sellerName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primaryText,
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    sellerLocation: {
      fontSize: 13,
      color: colors.secondaryText,
    },
    sellerStats: {
      marginTop: 2,
    },
    statText: {
      fontSize: 12,
      color: colors.accent,
      fontWeight: '500',
    },
    contactButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    contactButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500',
    },

    // Description
    descriptionContainer: {
      marginBottom: 8,
    },
    descriptionTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.primaryText,
      marginBottom: 12,
    },
    description: {
      fontSize: 15,
      color: colors.secondaryText,
      lineHeight: 24,
    },

    // Related Products
    relatedSection: {
      backgroundColor: colors.background,
      marginTop: 12,
      paddingVertical: 24,
    },
    relatedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    relatedTitle: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.primaryText,
    },
    seeAllText: {
      fontSize: 14,
      color: colors.accent,
      fontWeight: '600',
    },
    relatedScrollContent: {
      paddingHorizontal: 20,
    },
    relatedCard: {
      width: 180,
      backgroundColor: colors.cardBackground,
      borderRadius: 5,
      overflow: 'hidden',
      marginRight: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    relatedImageContainer: {
      position: 'relative',
    },
    relatedImage: {
      width: '100%',
      height: 140,
      backgroundColor: colors.secondaryBackground,
    },
    relatedFavoriteButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 28,
      height: 28,
      backgroundColor: colors.favoriteBtnBg,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    relatedDiscountBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: colors.accentRed,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    relatedDiscountText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '500',
    },
    relatedInfo: {
      padding: 8,
      position: 'relative',
    },
    relatedItemTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primaryText,
      marginBottom: 5,
      lineHeight: 20,
      minHeight: 10,
    },
    relatedRating: {
      flexDirection: 'row',
      gap: 30,
      marginBottom: 8,
    },
    productRegion: {
      fontSize: 12,
      color: colors.secondaryText,
    },
    relatedPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 2,
    },
    relatedPrice: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '500',
    },
    relatedOriginalPrice: {
      fontSize: 12,
      color: colors.mutedText,
      textDecorationLine: 'line-through',
    },
    relatedAddButton: {
      position: 'absolute',
      top: 100,
      right: 12,
      width: 30,
      height: 30,
      backgroundColor: colors.accentBadge,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.accentBadgeBorder,
    },

    // Bottom Container
    bottomContainer: {
      backgroundColor: colors.cardBackground,
      borderTopWidth: 1,
      borderTopColor: colors.lightBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    bottomContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 34,
      gap: 16,
    },
    bottomPriceInfo: {
      flex: 1,
    },
    bottomTotalLabel: {
      fontSize: 12,
      color: colors.secondaryText,
      marginBottom: 4,
    },
    bottomTotalPrice: {
      fontSize: 22,
      fontWeight: '500',
      color: colors.primaryText,
      marginBottom: 2,
    },
    bottomSavings: {
      fontSize: 12,
      color: colors.accentGreen,
      fontWeight: '500',
    },
    buyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: 16,
      paddingHorizontal: 28,
      borderRadius: 28,
      gap: 8,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, width: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      minWidth: 180,
    },
    buyButtonDisabled: {
      backgroundColor: colors.mutedText,
    },
    buyButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
  });
};